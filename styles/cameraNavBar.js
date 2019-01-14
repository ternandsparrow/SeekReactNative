import { StyleSheet, Platform } from "react-native";
import {
  colors,
  fonts,
  fontSize,
  margins,
  padding
} from "./global";

export default StyleSheet.create( {
  container: {
    flex: 1
  },
  header: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Platform.OS === "android" ? margins.medium : margins.medium,
    marginHorizontal: margins.medium
  },
  text: {
    fontSize: fontSize.buttonText,
    color: colors.white,
    fontFamily: fonts.default,
    textAlign: "center"
  }
} );
