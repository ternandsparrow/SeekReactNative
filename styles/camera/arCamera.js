import { StyleSheet, Dimensions, Platform } from "react-native";
import { colors, fonts } from "../global";

const { width, height } = Dimensions.get( "window" );

export default StyleSheet.create( {
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.black
  },
  camera: {
    width,
    height,
    zIndex: -2
  },
  header: {
    position: "absolute",
    top: height > 670 ? 80 : 40
  },
  backButton: {
    position: "absolute",
    top: height > 670 ? 49 : 19,
    left: 23
  },
  greenButton: {
    backgroundColor: colors.seekGreen,
    borderRadius: 6,
    height: 26,
    width: 101,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center"
  },
  greenButtonText: {
    paddingTop: Platform.OS === "ios" ? 6 : null,
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.white,
    letterSpacing: 0.94
  },
  predictions: {
    textAlign: "center",
    margin: 23,
    fontSize: 20,
    fontFamily: fonts.semibold,
    color: colors.white
  },
  dotRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "center",
    alignItems: "center"
  },
  dots: {
    marginHorizontal: width / 27
  },
  safeView: {
    flex: 1,
    backgroundColor: colors.black
  },
  scanText: {
    position: "absolute",
    bottom: 95,
    fontSize: 16,
    textAlign: "center",
    color: colors.white,
    margin: 20,
    lineHeight: 21,
    fontFamily: fonts.semibold,
    maxWidth: 293
  },
  shutter: {
    zIndex: 1,
    position: "absolute",
    bottom: 18
  },
  help: {
    zIndex: 1,
    position: "absolute",
    right: 64,
    bottom: 35
  },
  loading: {
    position: "absolute",
    top: height / 2 - 50
  },
  // errorText: {
  //   textAlign: "center",
  //   marginHorizontal: 41,
  //   fontSize: 19,
  //   lineHeight: 24,
  //   fontFamily: fonts.medium,
  //   color: colors.white
  // },
  touchable: {
    left: 23,
    right: 23,
    top: 23,
    bottom: 23
  }
} );
