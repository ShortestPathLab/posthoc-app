import React from "react";
import GoogleSignInButton from "./GoogleSignInButton";

type SavedLogServiceType = "google" | "local";

const SavedLogsButton = ({ type }: { type: SavedLogServiceType }) => {
  switch (type) {
    case "google":
      return <GoogleSignInButton />;
    default:
      return null;
  }
};

export default SavedLogsButton;
