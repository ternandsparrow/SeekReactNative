import { StyleSheet } from "react-native";
import { colors, fonts } from "../global";

export default StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  image: {
    marginBottom: 15
  },
  textContainer: {
    marginTop: 20,
    alignItems: "center",
    marginHorizontal: 26
  },
  block: {
    marginTop: 20
  },
  boldText: {
    marginBottom: 9,
    color: colors.black,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 21,
    textAlign: "center"
  },
  text: {
    marginBottom: 15,
    color: colors.black,
    fontFamily: fonts.book,
    fontSize: 16,
    lineHeight: 21,
    textAlign: "center"
  },
  greenText: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    color: colors.seekForestGreen,
    letterSpacing: 1.0
  }
} );
