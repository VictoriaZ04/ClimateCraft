import { AppWindow } from "../AppWindow";
import {
  OWGamesEvents,
  OWHotkeys
} from "@overwolf/overwolf-api-ts";
import { interestingFeatures, hotkeys, windowNames } from "../consts";
import WindowState = overwolf.windows.WindowStateEx;

class InGame extends AppWindow{
  private static _instance: InGame;
  private _minecraftGameEventsListener: OWGamesEvents;
  private _eventsLog: HTMLElement;
  private _infoLog: HTMLElement;

  private constructor(){
    super(windowNames.inGame);

    this._eventsLog = document.getElementById('eventsLog');
    this._infoLog = document.getElementById('infoLog');

    this._minecraftGameEventsListener = new OWGamesEvents({
      onInfoUpdates: this.onInfoUpdates.bind(this),
      onNewEvents: this.onNewEvents.bind(this)
    },
      interestingFeatures);
  }


  public static instance() {
    if (!this._instance) {
      this._instance = new InGame();
    }

    return this._instance;
  }

  public run() {
    this._minecraftGameEventsListener.start();
  }

  private onInfoUpdates(info) {
    this.logLine(this._infoLog, info, false);
  }

  private onNewEvents(e) {
    const shouldHighlight = e.events.some(event => {
      switch (event.name) {
        case 'game_info':
        case 'match_info':
          return true;
      }

      return false
    });
    this.logLine(this._eventsLog, e, shouldHighlight);
  }

  // Displays the toggle minimize/restore hotkey in the window header
  private async setToggleHotkeyText() {
    const hotkeyText = await OWHotkeys.getHotkeyText(hotkeys.hotkey1, 8032);
    const hotkeyElem = document.getElementById('hotkey');
    hotkeyElem.textContent = hotkeyText;
  }

  // Sets toggleInGameWindow as the behavior for the Ctrl+F hotkey
  private async setToggleHotkeyBehavior() {
    const toggleInGameWindow = async (hotkeyResult: overwolf.settings.hotkeys.OnPressedEvent): Promise<void> => {
      console.log(`pressed hotkey for ${hotkeyResult.name}`);
      const inGameState = await this.getWindowState();

      if (inGameState.window_state === WindowState.NORMAL ||
        inGameState.window_state === WindowState.MAXIMIZED) {
        this.currWindow.minimize();
      } else if (inGameState.window_state === WindowState.MINIMIZED ||
        inGameState.window_state === WindowState.CLOSED) {
        this.currWindow.restore();
      }
    }
      OWHotkeys.onHotkeyDown(hotkeys.hotkey1, toggleInGameWindow);

    }

  private logLine(log: HTMLElement, data, highlight) {
    console.log(`${log.id}:`);
    console.log(data);
    const line = document.createElement('pre');
    line.textContent = JSON.stringify(data);

    if (highlight) {
      line.className = 'highlight';
    }

    const shouldAutoScroll = (log.scrollTop + log.offsetHeight) > (log.scrollHeight - 10);

    log.appendChild(line);

    if (shouldAutoScroll) {
      log.scrollTop = log.scrollHeight;
    }
  }
}
var onErrorListener,onInfoUpdates2Listener,	onNewEventsListener;
var testlistener

function registerEvents() {

  onErrorListener = function(info) {
    console.log("Error: " + JSON.stringify(info));
  }
  
  onInfoUpdates2Listener = function(info) {
    console.log("Info UPDATE: " + JSON.stringify(info));
  }
  
  onNewEventsListener = function(info) {
    console.log("EVENT FIRED: " + JSON.stringify(info));

  
  }
  
  // general events errors
  overwolf.games.events.onError.addListener(onErrorListener);
  
  // "static" data changed (total kills, username, steam-id)
  // This will also be triggered the first time we register
  // for events and will contain all the current information
  overwolf.games.events.onInfoUpdates2.addListener(onInfoUpdates2Listener);									
  // an event triggerd
  overwolf.games.events.onNewEvents.addListener(onNewEventsListener);
}

function unregisterEvents() {
    overwolf.games.events.onError.removeListener(onErrorListener);
  overwolf.games.events.onInfoUpdates2.removeListener(onInfoUpdates2Listener);
    overwolf.games.events.onNewEvents.removeListener(onNewEventsListener);
}
  
function gameLaunched(gameInfoResult) {
  if (!gameInfoResult) {
    return false;
  }

  if (!gameInfoResult.gameInfo) {
    return false;
  }

  if (!gameInfoResult.runningChanged && !gameInfoResult.gameChanged) {
    return false;
  }

  if (!gameInfoResult.gameInfo.isRunning) {
    return false;
  }

  // NOTE: we divide by 10 to get the game class id without it's sequence number
  if (Math.floor(gameInfoResult.gameInfo.id/10) != 8032) {
    return false;
  }

  console.log("Minecraft Launched");
  return true;

}

var g_interestedInFeatures = [
  'game_info',
  'match_info'
];

function gameRunning(gameInfo) {

  if (!gameInfo) {
    return false;
  }

  if (!gameInfo.isRunning) {
    return false;
  }

  // NOTE: we divide by 10 to get the game class id without it's sequence number
  if (Math.floor(gameInfo.id/10) != 8032) {
    return false;
  }

  console.log("Minecraft running");
  return true;

}


function setFeatures() {
  overwolf.games.events.setRequiredFeatures(g_interestedInFeatures, function(info) {
    // if (info.status == "error")
    // {
    //   //console.log("Could not set required features: " + info.reason);
    //   //console.log("Trying in 2 seconds");
    //   window.setTimeout(setFeatures, 2000);
    //   return;
    // }

    console.log("Set required features:");
    console.log(JSON.stringify(info));
  });
}




// Start here
overwolf.games.onGameInfoUpdated.addListener(function (res) {
  if (gameLaunched(res)) {
    unregisterEvents();
    registerEvents();
    setTimeout(setFeatures, 1000);
  }
  console.log("onGameInfoUpdated: " + JSON.stringify(res));
});

overwolf.games.getRunningGameInfo(function (res) {
  if (gameRunning(res)) {
    registerEvents();
    setTimeout(setFeatures, 1000);
  }
  console.log("getRunningGameInfo: " + JSON.stringify(res));
});
overwolf.windows.changePosition("in_game", 0, 225, (callback) => {
  console.log(callback);
})


