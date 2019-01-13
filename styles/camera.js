import { StyleSheet } from "react-native";
import { colors, padding } from "./global";

export default StyleSheet.create( {
  container: {
    flex: 1
  },
  main: {
    flexGrow: 1
  },
  footer: {
    justifyContent: "flex-end",
    paddingBottom: padding.large
  },
  capture: {
    backgroundColor: colors.white,
    borderWidth: 3,
    borderRadius: 100,
    borderColor: colors.darkGray,
    alignSelf: "center",
    width: 50,
    height: 50
  }
} );
