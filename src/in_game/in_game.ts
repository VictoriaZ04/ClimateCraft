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
  private _timerOn = false;
  private _startTime = 0;
  private _time = "00:00:00";
  private _keepTime = 0;

  private constructor(){
    super(windowNames.inGame);

    this.setToggleHotkeyBehavior();
    this.setToggleHotkeyText();
   
      
    overwolf.settings.hotkeys.onPressed.addListener((res) => {
      console.log("======================= " + JSON.stringify(res.name));
      if(this._timerOn){
        this._timerOn = false
      }
      else{
        this._timerOn = true;
        this._startTime = new Date().getTime();
        this.timer()
      }
    })

  }


  public static instance() {
    if (!this._instance) {
      this._instance = new InGame();
    }

    return this._instance;
  }


  // Displays the toggle minimize/restore hotkey in the window header
  private async setToggleHotkeyText() {
    const hotkeyText = await OWHotkeys.getHotkeyText(hotkeys.hotkey1, 8032);
    const hotkeyTimer = await OWHotkeys.getHotkeyText(hotkeys.timer, 8032);

    const hotkeyElem = document.getElementById('showhide');
    const hotkeyElem2 = document.getElementById('timer');

    hotkeyElem.textContent = hotkeyText;
    hotkeyElem2.textContent = hotkeyTimer;

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
    const toggleTimer = async (hotkeyResult: overwolf.settings.hotkeys.OnPressedEvent): Promise<void> =>{
      console.log("=======================");
      if(this._timerOn){
        this._timerOn = false
      }
      else{
        this._timerOn = true;
        this._startTime = new Date().getTime();
        this.timer()
      }
    }
      OWHotkeys.onHotkeyDown(hotkeys.timer, toggleTimer);
      OWHotkeys.onHotkeyDown(hotkeys.hotkey1, toggleInGameWindow);

    }
    private timer() {
        this._time = "";
        this._keepTime = new Date().getTime() - this._startTime;
        this._time = Math.floor(((this._keepTime) / 10) % 10) + this._time;
        this._time = Math.floor(((this._keepTime) / 100) % 10) + this._time;
        this._time = Math.floor(((this._keepTime) / 1000) % 60) + this._time;
        this._keepTime = Math.floor(this._keepTime / 1000);
        this._time = Math.floor(((this._keepTime)/60) % 60) + this._time;
        if((this._keepTime)/60 >= 60){
          this._keepTime = (this._keepTime)/60;
          this._time = Math.floor(((this._keepTime) / 60)) + this._time;
        
      }
      console.log(this._time);
      this._infoLog.remove();
      this._infoLog.append(this._time);
  
      
    }
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
  overwolf.extensions.io.readTextFile(overwolf.extensions.io.StorageSpace.appData,("..\\AppData\\Roaming\\.minecraft\\saves\\World\\stats\\83ff73b8-7385-4222-819f-e29ebc16c59f.json"),(stat) => {
    console.log("===================================== " + JSON.stringify(stat) )
  });

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


overwolf.games.getRunningGameInfo(function (res) {
  if (gameRunning(res)) {
    setTimeout(setFeatures, 1000);
  }
  console.log("getRunningGameInfo: " + JSON.stringify(res));
});
overwolf.windows.changePosition("in_game", 0, 225, (callback) => {
  console.log(callback);
})
