// @flow

import React, { Component } from "react";
import {
  View,
  Platform
} from "react-native";
import inatjs from "inaturalistjs";
import jwt from "react-native-jwt-io";
import ImageResizer from "react-native-image-resizer";
import Realm from "realm";
import moment from "moment";
import { NavigationEvents } from "react-navigation";

import i18n from "../../i18n";
import realmConfig from "../../models";
import ErrorScreen from "./Error";
import ConfirmScreen from "./ConfirmScreen";
import AncestorScreen from "./AncestorScreen";
import MatchScreen from "./MatchScreen";
import NoMatchScreen from "./NoMatchScreen";
import config from "../../config";
import styles from "../../styles/results/results";
import {
  addToCollection,
  capitalizeNames,
  flattenUploadParameters,
  getTaxonCommonName
} from "../../utility/helpers";
import { getLatAndLng } from "../../utility/locationHelpers";
import { checkNumberOfBadgesEarned } from "../../utility/badgeHelpers";
import { checkNumberOfChallengesCompleted } from "../../utility/challengeHelpers";
import AlreadySeenScreen from "./AlreadySeenScreen";

type Props = {
  navigation: any
}

class Results extends Component<Props> {
  constructor( { navigation }: Props ) {
    super();

    const {
      image,
      time,
      latitude,
      longitude,
      predictions
    } = navigation.state.params;

    this.state = {
      threshold: 0.7,
      predictions,
      image,
      time,
      latitude,
      longitude,
      userImage: null,
      speciesSeenImage: null,
      observation: null,
      taxaId: null,
      taxaName: null,
      commonAncestor: null,
      match: null,
      seenDate: null,
      loading: true,
      photoConfirmed: false,
      error: null
    };

    this.confirmPhoto = this.confirmPhoto.bind( this );
  }

  async getLocation() {
    const { latitude, longitude } = this.state;
    if ( !latitude || !longitude ) {
      const location = await getLatAndLng();
      this.setLocation( location );
    }
  }

  setLocation( location ) {
    this.setState( {
      latitude: Number( location.latitude ),
      longitude: Number( location.longitude )
    } );
  }

  setImageUri( uri ) {
    this.setState( { userImage: uri }, () => this.checkOnlineOrOfflineVision() );
  }

  setLoading( loading ) {
    this.setState( { loading } );
  }

  setSeenDate( seenDate ) {
    this.setState( { seenDate } );
  }

  setMatch( match ) {
    this.setState( { match } );
  }

  setError( error ) {
    this.setLoading( false );
    this.setState( { error } );
  }

  setCommonAncestor( ancestor, speciesSeenImage ) {
    getTaxonCommonName( ancestor.taxon_id ).then( ( commonName ) => {
      this.setState( {
        commonAncestor: commonName || ancestor.name,
        taxaId: ancestor.taxon_id,
        speciesSeenImage
      }, () => this.showNoMatch() );
    } );
  }

  setOnlineVisionSpeciesResults( species ) {
    const { taxon } = species;
    const photo = taxon.default_photo;

    this.setState( {
      observation: species,
      taxaId: taxon.id,
      taxaName: capitalizeNames( taxon.preferred_common_name || taxon.name ),
      speciesSeenImage: photo ? photo.medium_url : null
    }, () => this.showMatch() );
  }

  setOnlineVisionAncestorResults( commonAncestor ) {
    const { taxon } = commonAncestor;
    const photo = taxon.default_photo;

    this.setState( {
      commonAncestor: commonAncestor
        ? capitalizeNames( taxon.preferred_common_name || taxon.name )
        : null,
      speciesSeenImage: photo ? photo.medium_url : null
    }, () => this.showNoMatch() );
  }

  setARCameraVisionResults() {
    const { predictions, threshold } = this.state;
    const species = predictions.find( leaf => leaf.rank === 10 );

    if ( species && species.score > threshold ) {
      this.setState( {
        taxaId: Number( species.taxon_id )
      }, () => {
        this.checkDateSpeciesSeen( Number( species.taxon_id ) );
        this.fetchAdditionalTaxaInfo();
      } );
    } else {
      this.checkForCommonAncestor();
    }
  }

  getParamsForOnlineVision() {
    const {
      userImage,
      time,
      latitude,
      longitude
    } = this.state;

    const params = flattenUploadParameters( userImage, time, latitude, longitude );
    params.locale = i18n.currentLocale();

    this.fetchScore( params );
  }

  checkOnlineOrOfflineVision() {
    const { predictions } = this.state;

    if ( predictions && predictions.length > 0 ) {
      this.setARCameraVisionResults();
    } else {
      this.getParamsForOnlineVision();
    }
  }

  async showMatch() {
    await this.addObservation();
    this.setMatch( true );
    this.setLoading( false );
  }

  showNoMatch() {
    this.setMatch( false );
    this.setLoading( false );
  }

  fetchAdditionalTaxaInfo() {
    const { taxaId } = this.state;

    inatjs.taxa.fetch( taxaId ).then( ( response ) => {
      const taxa = response.results[0];

      this.setState( {
        taxaName: capitalizeNames( taxa.preferred_common_name || taxa.name ),
        observation: {
          taxon: {
            default_photo: taxa.default_photo,
            id: Number( taxaId ),
            name: taxa.name,
            preferred_common_name: taxa.preferred_common_name,
            iconic_taxon_id: taxa.iconic_taxon_id
          }
        },
        speciesSeenImage: taxa.taxon_photos[0] ? taxa.taxon_photos[0].photo.medium_url : null
      }, () => this.showMatch() );
    } ).catch( () => {
      this.setError( "taxaInfo" );
    } );
  }

  fetchAdditionalAncestorInfo( ancestor ) {
    inatjs.taxa.fetch( ancestor.taxon_id ).then( ( response ) => {
      const taxa = response.results[0];
      const speciesSeenImage = taxa.taxon_photos[0] ? taxa.taxon_photos[0].photo.medium_url : null;
      this.setCommonAncestor( ancestor, speciesSeenImage );
    } ).catch( () => {
      this.setError( "ancestorInfo" );
    } );
  }

  checkForCommonAncestor() {
    const { predictions, threshold } = this.state;
    const reversePredictions = predictions.reverse();

    const ancestor = reversePredictions.find( leaf => leaf.score > threshold );

    if ( ancestor && ancestor.rank !== 100 ) {
      this.fetchAdditionalAncestorInfo( ancestor );
    } else {
      this.showNoMatch();
    }
  }

  resizeImage() {
    const { image } = this.state;

    ImageResizer.createResizedImage( image.uri, 299, 299, "JPEG", 80 )
      .then( ( { uri } ) => {
        let userImage;
        if ( Platform.OS === "ios" ) {
          const uriParts = uri.split( "://" );
          userImage = uriParts[uriParts.length - 1];
          this.setImageUri( userImage );
        } else {
          userImage = uri;
          this.setImageUri( userImage );
        }
      } ).catch( () => {
        this.setError( "image" );
      } );
  }

  createJwtToken() {
    const claims = {
      application: "SeekRN",
      exp: new Date().getTime() / 1000 + 300
    };

    const token = jwt.encode( claims, config.jwtSecret, "HS512" );
    return token;
  }

  fetchScore( params ) {
    const token = this.createJwtToken();

    inatjs.computervision.score_image( params, { api_token: token } )
      .then( ( response ) => {
        const species = response.results[0];
        const commonAncestor = response.common_ancestor;

        if ( species.combined_score > 97 ) {
          this.checkDateSpeciesSeen( species.taxon.id );
          this.setOnlineVisionSpeciesResults( species );
        } else if ( commonAncestor ) {
          this.setOnlineVisionAncestorResults( commonAncestor );
        } else {
          this.showNoMatch();
        }
      } ).catch( () => {
        this.setError( "onlineVision" );
      } );
  }

  addObservation() {
    const {
      latitude,
      longitude,
      observation,
      image
    } = this.state;

    addToCollection( observation, latitude, longitude, image );
  }

  checkDateSpeciesSeen( taxaId ) {
    Realm.open( realmConfig )
      .then( ( realm ) => {
        const seenTaxaIds = realm.objects( "TaxonRealm" ).map( t => t.id );
        if ( seenTaxaIds.includes( taxaId ) ) {
          const seenTaxa = realm.objects( "ObservationRealm" ).filtered( `taxon.id == ${taxaId}` );
          const seenDate = moment( seenTaxa[0].date ).format( "ll" );
          this.setSeenDate( seenDate );
        } else {
          this.setSeenDate( null );
        }
      } ).catch( () => {
        this.setSeenDate( null );
      } );
  }

  confirmPhoto() {
    this.setState( { photoConfirmed: true } );
  }

  render() {
    const {
      userImage,
      taxaName,
      match,
      taxaId,
      speciesSeenImage,
      commonAncestor,
      seenDate,
      loading,
      image,
      photoConfirmed,
      error
    } = this.state;
    const { navigation } = this.props;

    let resultScreen;

    if ( error === "onlineVision" ) {
      resultScreen = <ErrorScreen error={i18n.t( "results.error_server" )} navigation={navigation} />;
    } else if ( error === "image" ) {
      resultScreen = <ErrorScreen error={i18n.t( "results.error_image" )} navigation={navigation} />;
    } else if ( error === "taxaInfo" ) {
      resultScreen = <ErrorScreen error={i18n.t( "results.error_species" )} navigation={navigation} />;
    } else if ( error === "ancestorInfo" ) {
      resultScreen = <ErrorScreen error={i18n.t( "results.error_ancestor" )} navigation={navigation} />;
    } else if ( seenDate ) {
      resultScreen = (
        <AlreadySeenScreen
          navigation={navigation}
          userImage={userImage}
          taxaName={taxaName}
          taxaId={taxaId}
          speciesSeenImage={speciesSeenImage}
          seenDate={seenDate}
        />
      );
    } else if ( match && taxaName ) {
      resultScreen = (
        <MatchScreen
          navigation={navigation}
          userImage={userImage}
          taxaName={taxaName}
          taxaId={taxaId}
          speciesSeenImage={speciesSeenImage}
        />
      );
    } else if ( !match && commonAncestor ) {
      resultScreen = (
        <AncestorScreen
          navigation={navigation}
          userImage={userImage}
          speciesSeenImage={speciesSeenImage}
          commonAncestor={commonAncestor}
        />
      );
    } else {
      resultScreen = (
        <NoMatchScreen
          navigation={navigation}
          userImage={userImage}
        />
      );
    }

    return (
      <View style={styles.container}>
        <NavigationEvents
          onWillFocus={() => {
            this.getLocation();
            this.resizeImage();
            checkNumberOfBadgesEarned();
            checkNumberOfChallengesCompleted();
          }}
        />
        {!loading && photoConfirmed
          ? resultScreen
          : (
            <ConfirmScreen
              navigation={navigation}
              image={image}
              photoConfirmed={photoConfirmed}
              loading={loading}
              confirmPhoto={this.confirmPhoto}
            />
          )}
      </View>
    );
  }
}

export default Results;
