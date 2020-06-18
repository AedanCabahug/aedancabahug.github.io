window.onload = function () {
    // Time
    var ClockElement = document.querySelector(".time");
    var PreviousValue = "";

    function pad(n) {
        return n < 10 ? "0" + n : n + "";
    }
    function hex(n) {
        if (n.toString(16).length < 2) return '0' + n;
        return n.toString(16);
    }

    setInterval(function () {
        var Time = new Date().getHours() + ":" + pad(new Date().getMinutes());

        if (Time != PreviousValue) {
            ClockElement.innerHTML = Time;

            var Arr = ClockElement.innerHTML.split("");
            var SplitArr = [];

            ClockElement.innerHTML = "";
            for (var i = 0; i < Arr.length; i++) {
                var ChildElement = document.createElement("span");
                ChildElement.innerHTML = Arr[i];
                ClockElement.appendChild(ChildElement);
            }

            PreviousValue = Time;
        }

        for (var i = 0; i < ClockElement.children.length; i++) {
            ClockElement.children[i].style.color = AnimatedColor(i * 16);
        }

        for (var i = 0; i < document.querySelectorAll("#hovered").length; i++) {
            document.querySelectorAll("#hovered")[i].style.color = AnimatedColor(0);
        }
    });

    for (var i = 0; i < document.querySelectorAll("a").length; i++) {
        document.querySelectorAll("a")[i].onmouseenter = function () {
            this.id = "hovered";
        };
        document.querySelectorAll("a")[i].onmouseleave = function () {
            this.id = "";
        };
    }

    var Timer = 0;
    var Negate = false;
    function AnimatedColor(Offset) {
        var r = Math.ceil(parseInt("009688".substring(0, 2), 16) * ((Timer + Offset) / 360) + parseInt("006296".substring(0, 2), 16) * (1 - ((Timer + Offset) / 360)));
        var g = Math.ceil(parseInt("009688".substring(2, 4), 16) * ((Timer + Offset) / 360) + parseInt("006296".substring(2, 4), 16) * (1 - ((Timer + Offset) / 360)));
        var b = Math.ceil(parseInt("009688".substring(4, 6), 16) * ((Timer + Offset) / 360) + parseInt("006296".substring(4, 6), 16) * (1 - ((Timer + Offset) / 360)));

        return '#' + hex(r) + hex(g) + hex(b);
    }

    setInterval(function () {
        if (Negate) {
            Timer --;
        } else Timer ++;
        if (Timer >= 360)
            Negate = true;
        else if (Timer <= 0)
            Negate = false;
    });
};