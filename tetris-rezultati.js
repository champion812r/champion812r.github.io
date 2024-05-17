function displayTopScores() {
    let topScores = JSON.parse(localStorage.getItem('players')) || [];
    const topScoresTableBody = $('#top-scores-body');
    topScoresTableBody.empty();

    let scoreCnt = topScores.length;
    $("#last-username-value").html(scoreCnt?topScores[scoreCnt-1].username:"/");
    $("#last-score-value").html(scoreCnt?topScores[scoreCnt-1].score:"/");

    // console.log(topScores);
    topScores.sort((a,b)=>-(a.score-b.score));

    //[{"username":"nijelose","score":800},{"username":"losee","score":0},{"username":"ghbjnkm","score":0}]
    if(scoreCnt==0) {
        const tableRow = $('<tr>');
        tableRow.append(`<td>-</td>`);
        tableRow.append(`<td>-</td>`);
        tableRow.append(`<td>-</td>`);
        topScoresTableBody.append(tableRow);
    }
    for (let i = 0; i < Math.min(scoreCnt,5); i++) {
        const score = topScores[i] || { username: '', score: '' };
        const tableRow = $('<tr>');

        tableRow.append(`<td>${i + 1}</td>`);
        tableRow.append(`<td>${score.username}</td>`);
        tableRow.append(`<td>${score.score}</td>`);

        topScoresTableBody.append(tableRow);
    }
}

$(document).ready(function() {
   $("#home-button").click(function(){
        window.location.href = "tetris-uputstvo.html";
   });
   $("#play-again-button").click(function(){
        window.location.href = "tetris-igra.html";
    });
    displayTopScores();
});