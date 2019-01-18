import { StyleSheet, Platform, Dimensions } from "react-native";
import {
  colors,
  fonts,
  fontSize,
  margins,
  padding
} from "./global";

const { width } = Dimensions.get( "screen" );

export default StyleSheet.create( {
  safeContainer: {
    flex: 1,
    backgroundColor: "#0C2D3C"
  },
  mainContainer: {
    flex: 1,
    backgroundColor: colors.darkBlue
  },
  backgroundImage: {
    flex: 1
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between"
  },
  header: {
    marginTop: margins.medium
  },
  headerText: {
    marginLeft: margins.medium,
    fontSize: fontSize.smallText,
    color: colors.white,
    fontFamily: fonts.default
  },
  buttons: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between"
  },
  locationChooser: {
    paddingLeft: padding.large,
    maxWidth: 210,
    flexWrap: "nowrap"
  },
  locationChooserText: {
    color: colors.white,
    fontFamily: fonts.playful,
    fontSize: fontSize.buttonText
  },
  taxonChooser: {
    paddingRight: padding.large
  },
  taxonChooserText: {
    color: colors.white,
    fontFamily: fonts.default,
    fontSize: fontSize.text
  },
  taxonGrid: {
    alignItems: "center"
  },
  gridCell: {
    width: width / 3 - 2,
    height: 138,
    paddingHorizontal: padding.medium,
    marginBottom: margins.extraSmall
  },
  image: {
    width: "100%",
    aspectRatio: 1.2
  },
  gridCellContents: {
    borderRadius: 5,
    overflow: "hidden"
  },
  cellTitle: {
    height: 41,
    backgroundColor: colors.darkBlue,
    padding: padding.medium,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap"
  },
  cellTitleText: {
    color: colors.white,
    fontFamily: fonts.default,
    fontSize: fontSize.extraSmallText,
    paddingTop: padding.extraSmall
  },
  footer: {
    height: Platform.OS === "ios" ? 45 : 75,
    justifyContent: "flex-end",
    backgroundColor: colors.darkDesaturatedBlue
  },
  bottomRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between"
  },
  profileButton: {
    paddingLeft: padding.large
  },
  speciesCountButton: {
    paddingRight: padding.extraLarge,
    paddingTop: padding.medium,
    justifyContent: "center"
  },
  profileText: {
    color: colors.white,
    fontFamily: fonts.default,
    fontSize: fontSize.smallText
  },
  addPhotoButton: {
    paddingRight: padding.medium,
    paddingBottom: padding.medium
  }
} );
