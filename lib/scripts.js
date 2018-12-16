/*
NOTES FOR NEXT YEAR
add a second question for each companion, on a scale of 1-5 how much do you like/dislike them
    ['I love them', 'I like them', 'No strong feelings one way or the other', 'I dislike them', 'I wish they weren't on the show']
add Wilfrid to companions list
*/
function sha256(str) {
  var buffer = new TextEncoder("utf-8").encode(str);
  return crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
    return hex(hash);
  });
}
function hex(buffer) {
  var hexCodes = [];
  var view = new DataView(buffer);
  for (var i = 0; i < view.byteLength; i += 4) {
    var value = view.getUint32(i)
    var stringValue = value.toString(16)
    var padding = '00000000'
    var paddedValue = (padding + stringValue).slice(-padding.length)
    hexCodes.push(paddedValue);
  }
  return hexCodes.join("");
}
function getRanks(){
    var companions = JSON.parse(sessionStorage.companions);
    var ranks = {};
    for (let comp of companions) {
        ranks[comp] = document.getElementsByClassName(comp.concat(' rank'))[0].value
        if (ranks[comp] == "NaN" || ranks[comp] == '0') {
            alert("Please make sure you've ranked all 14 companions! None should be left as NaN or 0")
            return false;
        }
    }
    return ranks;
}
function submit(){
    sha256((Date.now() + Math.random()).toString()).then(function(uuid){
        if (localStorage.submitted == undefined) {
            if (getRanks() !== false) {
                return $.ajax({
                    method: 'post',
                    url: 'lib/submit.py',
                    data: {
                        'uuid': uuid,
                        'ranks': JSON.stringify(getRanks())
                    },
                    success: function(data) {
                        console.log(data);
                        localStorage.submitted = JSON.stringify(getRanks());
                        localStorage.uuid = uuid;
                        alert("Thank you for taking part in our Favourite Companions Survey. Results will be posted New Years Day after the new episode airs.");
                    }
                });
            }
        } else {
            alert("Your rankings have already been submitted. Results will be posted New Years Day after the new episode airs.");
        }
    });
}
Array.prototype.nand_arr = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};
function selected(){
    var ranks_all = JSON.parse(sessionStorage.available_ranks);
    var ranks_taken = [];
    for (let elem of document.getElementsByClassName('rank')) {
        if (elem.value != 0) {
            ranks_taken.push(parseInt(elem.value));
        }
    }
    var avail_ranks = ranks_all.nand_arr(ranks_taken);
    avail_ranks.sort(function(a, b){return a - b})
    for (let elem of document.getElementsByClassName('rank')) {
        var sel = parseInt(elem.value);
        if (sel != 0) {
            avail_ranks.push(sel);
            avail_ranks.sort(function(a, b){return a - b});
        }
        for (var i = elem.length -1; i >= 0;i--){
            elem.remove(i)
        }
        for (let rank of avail_ranks) {
            var option = document.createElement("option");
            option.text = rank;
            elem.add(option, elem[rank]);
        }
        elem.value = sel;
        if (sel != 0) {
            avail_ranks.splice(avail_ranks.indexOf(sel), 1);
            avail_ranks.sort(function(a, b){return a - b});
        }
    }
}
function create_selects(){
    if (Date.now() < 1546369200000) {
        var companions = JSON.parse(sessionStorage.companions);
        for (let companion of companions) {
            document.getElementsByClassName('sels wrapper')[0].innerHTML = document.getElementsByClassName('sels wrapper')[0].innerHTML.concat("<div class='").concat(companion).concat("'>").concat(companion).concat(" <select class='").concat(companion).concat(" rank' onchange='selected()'></select><div>")
        }
    }else {
        
    }
}
$(document).ready(function() {
    sessionStorage.setItem('companions', JSON.stringify(["Amy Pond", "Bill Pots", "Clara Oswald", "Cptn Jack Harkness", "Donna Noble", "Graham OBrien", "Martha Jones", "Mickey Smith", "Nardole", "River Song", "Rory Pond", "Rose Tyler", "Ryan Sinclair", "Yasmin Khan"]));
    var a = [];
    for (var i=0;i<=JSON.parse(sessionStorage.companions).length;i++){
        a.push(i);
    }
    sessionStorage.setItem('available_ranks',JSON.stringify(a));
    create_selects();
    selected();
    if (localStorage.submitted !== undefined) {
        var submitted = JSON.parse(localStorage.submitted);
        for (var k in submitted) {
            document.getElementsByClassName(k.concat(' rank'))[0].value = parseInt(submitted[k]);
        }
    }
});
