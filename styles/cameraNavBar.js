import { StyleSheet } from "react-native";
import {
  colors,
  fonts,
  fontSize,
  margins
} from "./global";

export default StyleSheet.create( {
  header: {
    marginHorizontal: margins.medium,
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: margins.medium
  },
  text: {
    fontSize: fontSize.buttonText,
    color: colors.white,
    fontFamily: fonts.default
  }
} );
