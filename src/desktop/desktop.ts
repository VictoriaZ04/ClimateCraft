import { AppWindow } from "../AppWindow";
import { windowNames } from "../consts";

// The desktop window is the window displayed while Fortnite is not running.
// In our case, our desktop window has no logic - it only displays static data.
// Therefore, only the generic AppWindow class is called.
new AppWindow(windowNames.desktop);

overwolf.games.launchers.getRunningLaunchersInfo((response) => {
    console.log(response)
});

overwolf.games.launchers.onLaunched.addListener((response) => {
    console.log(response)
})

overwolf.games.launchers.onTerminated.addListener((response) =>{
    console.log(response)
});