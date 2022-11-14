import React, { useState, useEffect } from "react";
import { Menu } from "@fluentui/react-northstar";
import "../css/Main.css";
import { Draft } from './Draft';

export function Main() {
  const targets = ["draft", "inbox", "outbox"];
  const targetTabName = {
    draft: "Draft",
    inbox: "Inbox",
    outbox: "Outbox",
  };
  const [selectedMenuItem, setSelectedMenuItem] = useState();

  useEffect(() =>{
   console.log("me first")
  }, [])

  const items = targets.map((step) => {
    return {
      key: step,
      content: targetTabName[step] || "",
      onClick: () => setSelectedMenuItem(step),
    };
  });

  return (
    <div className="welcome page">
      <div className="narrow page-padding">
        <Menu defaultActiveIndex={0} items={items} underlined secondary />
        <div className="sections">
          {selectedMenuItem === "draft" && (
            <div>
              <Draft/>
            </div>
          )}
          {selectedMenuItem === "inbox" && (
            <div>
            </div>
          )}
          {selectedMenuItem === "outbox" && (
            <div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
