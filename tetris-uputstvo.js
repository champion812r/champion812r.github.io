const shapes = {
    I: [
        [1, 1, 1, 1]
    ],
    J: [
        [0, 0, 1],
        [1, 1, 1]
    ],
    L: [
        [1, 0, 0],
        [1, 1, 1]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ]
};

const colors = ["light_blue", "dark_blue", "orange", "yellow", "green", "purple", "red"];
const keys = Object.keys(shapes);


function displayShapes() {
    let shapeSelection = $('#shape-selection');

    let i = -1;
    $.each(shapes, function(shape, shapeArray) {
        i++;
        let shapeContainer = $('<div>').addClass('shape-container selected').attr("id",keys[i]).click(function() {
            $(this).toggleClass('selected');
        });

        let table = $('<table>');

        $.each(shapeArray, function(rowIndex, row) {
            let tr = $('<tr>');
            $.each(row, function(cellIndex, cell) {
                let td = $('<td>');
                if (cell === 1) {
                    td.css('background-image', `url(tetris-dodatno/images/${colors[i]}.png)`);
                } else {
                    td.css('background-image', 'none');
                }
                tr.append(td);
            });
            table.append(tr);
        });

        shapeContainer.append(table);
        shapeSelection.append(shapeContainer);
    });
}

function fetchChosen() {
    let shapes = localStorage.getItem("chosen-shapes");
    if(shapes) {
        for(let key of keys) {
            if(!shapes.includes(key)) {
                $(`.shape-container#${key}`).toggleClass("selected");
            }
        }
    }
}



$(document).ready(function(){
    
    displayShapes();
    $("#mouse-instructions").hide();
    fetchChosen();


    $("#start-button").click(function(){
        let shapes = []
        for(let i=0; i<keys.length; ++i) {
            let id=keys[i][0];

            if($(`.shape-container#${id}`).hasClass("selected")){
                shapes.push(keys[i]);
            }
        }
        

        if(shapes.length==0) {
            alert("You have to choose at least 1 shape!");
            return;
        }
        localStorage.setItem("chosen-shapes",shapes);

        let diff = $("#difficulty").val();
        localStorage.setItem("chosen-level",diff);

        let mouse = $("#mouse").is(':checked');
        let keyboard = $("#keyboard").is(':checked');
        localStorage.setItem("controls",`{"mouse":${mouse}, "keyboard":${keyboard}}`);
        window.location.href = "tetris-igra.html";
    });
    $("#scoreboard-button").click(function(){window.location.href='tetris-rezultati.html';});
    $("#keyboard-label").click(function(){
        $("#mouse-instructions").hide();
        $("#keyboard-instructions").show();
    });
    $("#mouse-label").click(function(){
        $("#mouse-instructions").show();
        $("#keyboard-instructions").hide();
    });
})