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
  backgroundImage: {
    flex: 1,
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
  taxonGrid: {
    alignItems: "center"
  },
  taxonChooser: {
    paddingRight: padding.large
  },
  taxonChooserText: {
    color: colors.white,
    fontFamily: fonts.default,
    fontSize: fontSize.text
  },
  gridCell: {
    width: width / 3 - 2,
    paddingHorizontal: padding.medium,
    paddingTop: padding.medium
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
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap"
  },
  cellTitleText: {
    color: colors.white,
    fontFamily: fonts.default,
    fontSize: fontSize.extraSmallText
  },
  footer: {
    height: Platform.OS === "ios" ? 45 : 75,
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
