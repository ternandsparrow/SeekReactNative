// @flow

import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from "react-native";
import Realm from "realm";

import realmConfig from "../../models/index";
import styles from "../../styles/challenges/challengeDetails";
import i18n from "../../i18n";
import icons from "../../assets/icons";
import logos from "../../assets/logos";
import ChallengeMissionCard from "./ChallengeMissionCard";
import ChallengeBadge from "./ChallengeBadge";
import Footer from "./ChallengeFooter";
import { startChallenge } from "../../utility/helpers";

type Props = {
  navigation: any
}

class ChallengeDetailsScreen extends Component<Props> {
  constructor( { navigation }: Props ) {
    super();

    const { index } = navigation.state.params;

    this.state = {
      challenge: {},
      missions: {},
      challengeStarted: false,
      percentComplete: 100,
      modalVisible: false,
      index
    };
  }

  componentDidMount() {
    this.fetchChallengeDetails();
  }

  fetchChallengeDetails() {
    const { index } = this.state;

    Realm.open( realmConfig )
      .then( ( realm ) => {
        const challenges = realm.objects( "ChallengeRealm" ).filtered( `index == ${index}` );

        challenges.forEach( ( challenge ) => {
          this.setState( {
            challenge: {
              month: i18n.t( challenge.month ).toLocaleUpperCase(),
              name: i18n.t( challenge.name ).toLocaleUpperCase(),
              description: i18n.t( challenge.description ),
              started: challenge.started,
              completed: challenge.completed
            },
            missions: Object.values( challenge.missions ),
            challengeStarted: challenge.started
          } );
        } );
      } ).catch( ( err ) => {
        // console.log( "[DEBUG] Failed to open realm, error: ", err );
      } );
  }

  showMission() {
    startChallenge();
    this.setState( {
      challengeStarted: true
    } );
  }

  toggleBadgeModal() {
    const { modalVisible } = this.state;

    this.setState( {
      modalVisible: !modalVisible
    } );
  }

  render() {
    const {
      challengeStarted,
      percentComplete,
      modalVisible,
      challenge,
      missions
    } = this.state;
    const { navigation } = this.props;

    let button;

    if ( !challengeStarted ) {
      button = (
        <TouchableOpacity
          style={styles.greenButton}
          onPress={() => this.showMission()}
        >
          <Text style={styles.buttonText}>{i18n.t( "challenges.start_challenge" ).toLocaleUpperCase()}</Text>
        </TouchableOpacity>
      );
    } else if ( challengeStarted && percentComplete < 100 ) {
      button = (
        <TouchableOpacity
          style={styles.greenButton}
          onPress={() => navigation.navigate( "Camera", {
            id: null,
            commonName: null
          } )}
        >
          <Text style={styles.buttonText}>{i18n.t( "challenges.open_camera" ).toLocaleUpperCase()}</Text>
        </TouchableOpacity>
      );
    } else if ( challengeStarted && percentComplete === 100 ) {
      button = (
        <TouchableOpacity
          style={styles.greenButton}
          onPress={() => this.toggleBadgeModal()}
        >
          <Text style={styles.buttonText}>{i18n.t( "challenges.view_badge" ).toLocaleUpperCase()}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.container, modalVisible && styles.modalContainer]}>
        <SafeAreaView style={styles.safeViewTop} />
        <SafeAreaView style={styles.safeView}>
          <Modal
            transparent
            visible={modalVisible}
            onRequestClose={() => this.toggleBadgeModal()}
          >
            <View style={styles.modalView}>
              <ChallengeBadge />
              <TouchableOpacity
                onPress={() => this.toggleBadgeModal()}
                style={styles.backButton}
              >
                <Image source={icons.backButton} />
              </TouchableOpacity>
            </View>
          </Modal>
          {!modalVisible ? (
            <ScrollView>
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Image source={icons.backButton} />
                </TouchableOpacity>
                <Image style={styles.logo} source={logos.op} />
                <View />
              </View>
              <View style={styles.challengeContainer}>
                <Text style={styles.challengeHeader}>{challenge.month}</Text>
                <Text style={styles.challengeName}>{challenge.name}</Text>
                <View style={styles.row}>
                  <Image source={icons.badgePlaceholder} />
                  <Text style={styles.text}>{i18n.t( "challenges_card.join" )}</Text>
                </View>
                {button}
              </View>
              {challengeStarted ? (
                <ChallengeMissionCard
                  percentComplete={percentComplete}
                  missions={missions}
                />
              ) : null}
              <View style={styles.missionContainer}>
                <Text style={styles.missionText}>{challenge.description}</Text>
                <View style={styles.row}>
                  <Image source={logos.wwfop} />
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate( "Challenges" )}
                >
                  <Text style={styles.viewText}>{i18n.t( "challenges_card.view_all" )}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : null}
          {!modalVisible ? <Footer navigation={navigation} /> : null}
        </SafeAreaView>
      </View>
    );
  }
}

export default ChallengeDetailsScreen;