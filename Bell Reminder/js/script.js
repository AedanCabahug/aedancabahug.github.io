/* Customizable Variables */
let Saturation = 100; // Sets the saturation of the rainbow (Max: 100, Default: 100)
let Luminance = 60; // Sets the brightness of the rainbow (Max: 100, Default: 60)
let TickSpeed = 5; // Sets the interval of each tick which affects the rainbow speed (Default: 5)
let ChromaType = 0; // Sets the type of rainbow animation (Default: 0; 0: Wave, 1: Static, 2: Off)
let CharOffset = 5; // The color offset of each separate character (Default: 5)
let TextColor = "#FFFFFF"; // Sets the text color when chroma is disabled (Default: #FFFFFF)
let Background = ""; // Sets the background image (Default: "")
let MilitaryTime = false; // Enables 24 hours when set to true (Default: false)
let EnableSeconds = true; // Enables seconds when set to true (Default: true)
let DivisionPoints = 360; // Determines how the hue calculations work (Default: 160)
let BellRing = false; // Enables the bell ringing when class is starting
/* Customizable Variables */

/* Add Schedules Here */
const Schedules = {};
Schedules.LateStart = { Periods: [], Days: [1] };
Schedules.LateStart.Periods.push({ Name: 0, Start: CreateTimeStamp(08, 40), Duration: 21E5 });
Schedules.LateStart.Periods.push({ Name: 1, Start: CreateTimeStamp(09, 30), Duration: 222E4 });
Schedules.LateStart.Periods.push({ Name: 2, Start: CreateTimeStamp(10, 14), Duration: 222E4 });
Schedules.LateStart.Periods.push({ Name: 3, Start: CreateTimeStamp(10, 58), Duration: 222E4 });
Schedules.LateStart.Periods.push({ Name: 4, Start: CreateTimeStamp(11, 42), Duration: 222E4 });
Schedules.LateStart.Periods.push({ Name: 5, Start: CreateTimeStamp(12, 26), Duration: 222E4 });
Schedules.LateStart.Periods.push({ Name: 6, Start: CreateTimeStamp(13, 10), Duration: 222E4 });
Schedules.LateStart.Periods.push({ Name: 7, Start: CreateTimeStamp(13, 54), Duration: 222E4 });
Schedules.LateStart.Periods.push({ Name: 8, Start: CreateTimeStamp(14, 38), Duration: 222E4 });

Schedules.TueThur = { Periods: [], Days: [2, 4] };
Schedules.TueThur.Periods.push({ Name: 0, Start: CreateTimeStamp(06, 50), Duration: 36E5 });
Schedules.TueThur.Periods.push({ Name: 1, Start: CreateTimeStamp(08, 00), Duration: 36E5 });
Schedules.TueThur.Periods.push({ Name: 2, Start: CreateTimeStamp(09, 07), Duration: 36E5 });
Schedules.TueThur.Periods.push({ Name: 3, Start: CreateTimeStamp(10, 14), Duration: 36E5 });
Schedules.TueThur.Periods.push({ Name: 4, Start: CreateTimeStamp(11, 21), Duration: 36E5 });

Schedules.WedFri = { Periods: [], Days: [3, 5] };
Schedules.WedFri.Periods.push({ Name: 0, Start: CreateTimeStamp(06, 50), Duration: 36E5 });
Schedules.WedFri.Periods.push({ Name: 5, Start: CreateTimeStamp(08, 00), Duration: 36E5 });
Schedules.WedFri.Periods.push({ Name: 6, Start: CreateTimeStamp(09, 07), Duration: 36E5 });
Schedules.WedFri.Periods.push({ Name: 7, Start: CreateTimeStamp(10, 14), Duration: 36E5 });
Schedules.WedFri.Periods.push({ Name: 8, Start: CreateTimeStamp(11, 21), Duration: 36E5 });
/* Add Schedules Here */

let AnimTimer = 0;
let Timer = 0;
let CurrentSchedule;
let PassingPeriod = false;

let RingAudio = new Audio("sounds/Ring.mp3");
let BellInterval = 1300;
let BellVolume = 0.25;
let WillRing = false;

function Pad(X) {
    return X < 10 ? '0' + X : X + "";
}

function Hex(X) {
    if (X.toString(16).length < 2) return '0' + X;
    return X.toString(16);
}

function CreateTimeStamp(H, M, S) {
    return new Date("Tue January 1 2000 " + (H + ":" + (M) + ":" + (S || 0))).getTime();
}

function Rainbow(Offset) {
    if (ChromaType == 0) Offset += Timer;
    if (Offset >= DivisionPoints) Offset -= DivisionPoints;

    let RGB = ConvertHSL(ChromaType ? Math.round((Timer / DivisionPoints) * 100) / 100 : Math.round((Offset / DivisionPoints) * 100) / 100, Saturation / 100, Luminance / 100)
    return '#' + Hex(RGB[0].toString(16)) + Hex(RGB[1].toString(16)) + Hex(RGB[2].toString(16));
}

function ConvertHue(P, Q, T){
    if (T < 0) T += 1;
    if (T > 1) T -= 1;
    if (T < 1/6) return P + (Q - P) * 6 * T;
    if (T < 1/2) return Q;
    if (T < 2/3) return P + (Q - P) * (2/3 - T) * 6;
    return P;
}

function ConvertHSL(H, S, L){
    let R, G, B;

    if (S == 0) {
        R = G = B = L;
    } else {
        let Q = L < 0.5 ? L * (1 + S) : L + S - L * S;
        let P = 2 * L - Q;
        R = ConvertHue(P, Q, H + 1/3);
        G = ConvertHue(P, Q, H);
        B = ConvertHue(P, Q, H - 1/3);
    }

    return [Math.round(R * 255), Math.round(G * 255), Math.round(B * 255)];
}

function GetPeriod() {
    let CurrentTime = GetCurrentTime();

    for (let i = 0; i < CurrentSchedule.Periods.length; i++) {
        if (CurrentTime >= (CurrentSchedule.Periods[i].Start) && CurrentTime <= (CurrentSchedule.Periods[i].Start + CurrentSchedule.Periods[i].Duration)) {
            return CurrentSchedule.Periods[i];
        }
    }
}

function DetermineSchedule() {
    for (let i = 0; i < Object.keys(Schedules).length; i++) {
        if (Schedules[Object.keys(Schedules)[i]].Days.indexOf(new Date().getDay()) >= 0) {
            CurrentSchedule = Schedules[Object.keys(Schedules)[i]];
            return;
        }
    }

    CurrentSchedule = null;
}

function NextPeriod() {
    let CurrentTime = CreateTimeStamp(new Date().getHours(), new Date().getMinutes());

    for (let i = 1; i < CurrentSchedule.Periods.length; i++) {
        if (CurrentTime <= CurrentSchedule.Periods[i].Start && CurrentTime >= CurrentSchedule.Periods[i - 1].Start + CurrentSchedule.Periods[i - 1].Duration) {
            return CurrentSchedule.Periods[i];
        }
    }
}

function GetCurrentTime() {
    return CreateTimeStamp(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());
}

function PlayBell(N) {
    if (!BellRing) return;
    var I = 0;

    function SubFunc() {
        RingAudio.pause();
        RingAudio.currentTime = 0;

        I++;
        RingAudio.play();

        if (I < N) setTimeout(SubFunc, BellInterval);
    }

    SubFunc();
}

setInterval(function () {
    RingAudio.volume = BellVolume;
    document.querySelector(".settings").style.color = Rainbow(0);

    AnimTimer ++;
    if (AnimTimer % TickSpeed == 0) Timer ++;
    if (Timer > DivisionPoints) Timer = 0;

    let ClockElement = document.querySelector(".time-clock");
    let PeriodElement = document.querySelector(".time-period");
    let Hours = new Date().getHours();
    let PM = new Date().getHours() >= 12;

    DetermineSchedule();
    if (!CurrentSchedule) {
        let Time = Hours + ":" + Pad(new Date().getMinutes()) + (EnableSeconds ? Pad(":" + Pad(new Date().getSeconds())) : "") + " ";
        if (!MilitaryTime) Time += PM ? "PM" : "AM";
        let PeriodValue = "School Not in Session";

        if (Time != ClockElement.innerHTML) {
            ClockElement.innerHTML = Time;
    
            let Arr = ClockElement.innerHTML.split("");
            let SplitArr = [];
    
            ClockElement.innerHTML = "";
            for (let i = 0; i < Arr.length; i++) {
                let ChildElement = document.createElement("span");
                ChildElement.innerHTML = Arr[i];
                ClockElement.appendChild(ChildElement);
            }
        }
    
        if (PeriodValue != PeriodElement.innerHTML) {
            PeriodElement.innerHTML = PeriodValue;
    
            let Arr = PeriodElement.innerHTML.split("");
            let SplitArr = [];
    
            PeriodElement.innerHTML = "";
            for (let i = 0; i < Arr.length; i++) {
                let ChildElement = document.createElement("span");
                ChildElement.innerHTML = Arr[i];
                PeriodElement.appendChild(ChildElement);
            }
        }

        for (let i = 0; i < ClockElement.children.length; i++) {
            if (ChromaType == 2) {
                ClockElement.children[i].style.color = TextColor;
            } else ClockElement.children[i].style.color = Rainbow(i * CharOffset);
        }
    
        for (let i = 0; i < PeriodElement.children.length; i++) {
            if (ChromaType == 2) {
                PeriodElement.children[i].style.color = TextColor;
            } else PeriodElement.children[i].style.color = Rainbow(i * CharOffset);
        }

        return;
    }

    if (!MilitaryTime && Hours > 12) Hours -= 12;

    let ClockText = Hours + ":" + Pad(new Date().getMinutes()) + (EnableSeconds ? Pad(":" + Pad(new Date().getSeconds())) : "") + " ";
    let CurrentPeriod = GetPeriod();
    let PeriodText = "";

    if (!MilitaryTime) ClockText += PM ? "PM" : "AM";

    if (!CurrentPeriod) {
        if (!NextPeriod()) {
            PeriodText = "School Not in Session";
            if (!PassingPeriod && WillRing) {
                PlayBell(4);
                PassingPeriod = true;
                WillRing = false;
            }
        } else {
            if (!PassingPeriod && WillRing) {
                PlayBell(4);
                PassingPeriod = true;
                WillRing = false;
            }
            let PassingTimeLeft = Math.ceil((NextPeriod().Start - GetCurrentTime()) / 6E4);
            let SkipAppend = false;
            if (PassingTimeLeft >= 60) {
                let Remainder = PassingTimeLeft - (Math.floor(PassingTimeLeft / 60) * 60);
                TimeLeft = Math.floor(PassingTimeLeft / 60) + " Hours " + Remainder + " ";
                if (Remainder == 0) {
                    TimeLeft = Math.ceil(TimeLeft / 60) + " Hour";
                    if (CurrentPeriod.Name == -1) {
                        PeriodText = "Passing Period " + CurrentPeriod.Name + " (" + TimeLeft + " Seconds left)";
                    } else {
                        PeriodText = "Passing Period " + CurrentPeriod.Name + " (" + TimeLeft + " Seconds left)";
                    }
                    SkipAppend = true;
                }
            }
            if (!SkipAppend) { 
                if (PassingTimeLeft < 1) {
                    let Seconds = (NextPeriod().Start - GetCurrentTime()) / 1E3;
                    PeriodText = "Passing Period (" + Math.ceil(Seconds) + " Seconds left)";
                } else PeriodText = "Passing Period (" + PassingTimeLeft  + " Minutes left)";
            }

            if (NextPeriod().Name == -1) {
                PeriodText += " (Break Period next)";
            } else PeriodText += " (Period " + NextPeriod().Name + " next)";
        }
    } else {
        if (PassingPeriod) {
            PassingPeriod = false;
            WillRing = false;
            PlayBell(3);
        }
        let TimeLeft = Math.ceil(((CurrentPeriod.Start + CurrentPeriod.Duration) - GetCurrentTime()) / 6E4);
        let SkipAppend = false;
        if (TimeLeft < 5) WillRing = true;
        if (TimeLeft >= 60) {
            let Remainder = TimeLeft - (Math.floor(TimeLeft / 60) * 60);
            TimeLeft = Math.floor(TimeLeft / 60) + " Hours " + Math.ceil(Remainder) + " ";
            if (Remainder < 1) {
                TimeLeft = Math.floor(TimeLeft / 60) + " Hour";
                if (CurrentPeriod.Name == -1) {
                    PeriodText = "Break Period " + CurrentPeriod.Name + " (" + TimeLeft + " Seconds left)";
                } else {
                    PeriodText = "Period " + CurrentPeriod.Name + " (" + Math.ceil(TimeLeft) + " Seconds left)";
                }
                SkipAppend = true;
            }
        } else TimeLeft = Math.ceil(TimeLeft);
        if (!SkipAppend) {
            if (CurrentPeriod.Name == -1) {
                if (TimeLeft < 1) {
                    let Seconds = ((CurrentPeriod.Start + CurrentPeriod.Duration) - GetCurrentTime()) / 1E3;
                    PeriodText = "Break Period " + CurrentPeriod.Name + " (" + Math.ceil(Seconds) + " Seconds left)";
                } else PeriodText = "Break Period (" + TimeLeft + " Minutes left)";
            } else {
                if (TimeLeft < 1) {
                    let Seconds = ((CurrentPeriod.Start + CurrentPeriod.Duration) - GetCurrentTime()) / 1E3;
                    PeriodText = "Period " + CurrentPeriod.Name + " (" + Math.ceil(Seconds) + " Seconds left)";
                } else PeriodText = "Period " + CurrentPeriod.Name + " (" + TimeLeft + " Minutes left)";
            }
        }
    }

    if (ClockText != ClockElement.innerHTML) {
        ClockElement.innerHTML = ClockText;

        let Arr = ClockElement.innerHTML.split("");
        let SplitArr = [];

        ClockElement.innerHTML = "";
        for (let i = 0; i < Arr.length; i++) {
            let ChildElement = document.createElement("span");
            ChildElement.innerHTML = Arr[i];
            ClockElement.appendChild(ChildElement);
        }
    }

    if (PeriodText != PeriodElement.innerHTML) {
        PeriodElement.innerHTML = PeriodText;

        let Arr = PeriodElement.innerHTML.split("");
        let SplitArr = [];

        PeriodElement.innerHTML = "";
        for (let i = 0; i < Arr.length; i++) {
            let ChildElement = document.createElement("span");
            ChildElement.innerHTML = Arr[i];
            PeriodElement.appendChild(ChildElement);
        }
    }

    for (let i = 0; i < ClockElement.children.length; i++) {
        if (ChromaType == 2) {
            ClockElement.children[i].style.color = TextColor;
        } else ClockElement.children[i].style.color = Rainbow((i * CharOffset) + (CharOffset * 9));
    }

    for (let i = 0; i < PeriodElement.children.length; i++) {
        if (ChromaType == 2) {
            PeriodElement.children[i].style.color = TextColor;
        } else PeriodElement.children[i].style.color = Rainbow(i * CharOffset);
    }
});

function StoreSettings() {
    if (localStorage) {
        localStorage.setItem("Settings", JSON.stringify({
            Saturation: document.querySelector(".color-saturation").value,
            Luminance: document.querySelector(".color-luminance").value,
            TickSpeed: 4 - document.querySelector(".color-speed").value,
            CharOffset: document.querySelector(".color-range").value,
            TextColor: document.querySelector(".color-input").value,
            Background: document.querySelector(".background").value,
            MilitaryTime: document.querySelector(".military-time").checked,
            EnableSeconds: document.querySelector(".seconds-time").checked,
            BellRing: document.querySelector(".bell-ring").checked
        }));
    }
}

function LoadSettings() {
    if (localStorage && localStorage.getItem("Settings")) {
        let Loaded = JSON.parse(localStorage.getItem("Settings"));
        Saturation =  Loaded.Saturation; 
        Luminance = Loaded.Luminance;
        TickSpeed = Loaded.TickSpeed;
        CharOffset =  Loaded.CharOffset;
        TextColor = Loaded.TextColor;
        Background = Loaded.Background;
        MilitaryTime = Loaded.MilitaryTime;
        EnableSeconds = Loaded.EnableSeconds;
        BellRing = Loaded.BellRing;
        UpdateSettingsContainer();
    } else {
        Saturation = 100;
        Luminance = 60;
        TickSpeed = 2;
        ChromaType = 0;
        CharOffset = 5;
        TextColor = "#FFFFFF";
        Background = "";
        MilitaryTime = false;
        EnableSeconds = true;
        BellRing = false;
        UpdateSettingsContainer();
        StoreSettings();
    }
    UpdateClockBackground();
}

function UpdateClockBackground() {
    document.body.style.background = "url(" + (Background || "./images/Background.jpg") + ")";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.webkitBackgroundSsize = "100%"; 
    document.body.style.backgroundSize = "100%"; 
    document.body.style.webkitBackgroundSize = "cover"; 
    document.body.style.backgroundSize = "cover";

    let Img = document.createElement("img");
    Img.src = Background;

    Img.addEventListener("error", function () {
        document.body.style.background = "url(./images/Background.jpg)";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
        document.body.style.webkitBackgroundSsize = "100%"; 
        document.body.style.backgroundSize = "100%"; 
        document.body.style.webkitBackgroundSize = "cover"; 
        document.body.style.backgroundSize = "cover";
    });
}

function UpdateSettingsContainer() {
    document.querySelector(".color-saturation").value = Saturation; 
    document.querySelector(".color-luminance").value = Luminance;
    document.querySelector(".color-speed").value = TickSpeed + 4;
    document.querySelector(".color-range").value = CharOffset;
    document.querySelector(".color-input").value = TextColor;
    document.querySelector(".background").value = Background;
    document.querySelector(".military-time").checked = MilitaryTime;
    document.querySelector(".seconds-time").checked = EnableSeconds;
    document.querySelector(".bell-ring").checked = BellRing;

    if (ChromaType == 0) document.querySelector(".chroma-button").innerHTML = "Chroma Type: Wave";
    if (ChromaType == 1) document.querySelector(".chroma-button").innerHTML = "Chroma Type: Static";
    if (ChromaType == 2) document.querySelector(".chroma-button").innerHTML = "Chroma Type: Off";

    if (ChromaType != 0) {
        document.querySelector(".color-range").disabled = true;
    } else document.querySelector(".color-range").disabled = false;
}

window.addEventListener("load", function () {
    LoadSettings();

    document.querySelector(".settings").addEventListener("click", function () {
        if (document.querySelector(".settings-container").style.opacity == "1")
            document.querySelector(".settings-container").style.opacity = "0";
        else document.querySelector(".settings-container").style.opacity = "1";

        UpdateSettingsContainer();
    });

    document.querySelector(".submit").addEventListener("click", function () {
        StoreSettings();
    });

    document.querySelector(".chroma-button").addEventListener("click", function () {
        ChromaType ++;
        if (ChromaType > 2) ChromaType = 0;
        UpdateSettingsContainer();
    });

    document.querySelector(".reset").addEventListener("click", function () {
        Saturation = 100;
        Luminance = 60;
        TickSpeed = 2;
        ChromaType = 0;
        CharOffset = 5;
        TextColor = "#FFFFFF";
        Background = "";
        MilitaryTime = false;
        EnableSeconds = true;
        BellRing = false;
        UpdateSettingsContainer();
        StoreSettings();
    });

    setInterval(function () {
        Saturation = document.querySelector(".color-saturation").value;
        Luminance = document.querySelector(".color-luminance").value;
        TickSpeed = 4 - document.querySelector(".color-speed").value;
        CharOffset = document.querySelector(".color-range").value;
        TextColor = document.querySelector(".color-input").value;
        Background = document.querySelector(".background").value;
        MilitaryTime = document.querySelector(".military-time").checked;
        EnableSeconds = document.querySelector(".seconds-time").checked; 
        BellRing = document.querySelector(".bell-ring").checked; 

        if (document.body.style.background != "url(" + Background + ")") {
            UpdateClockBackground();
        }
    });
});