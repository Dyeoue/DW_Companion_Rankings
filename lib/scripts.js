/*
TODO THIS YEAR
write better explanations for the various ranking methods
minify scripts
NOTES FOR NEXT YEAR
add a second question for each companion, on a scale of 1-5 how much do you like/dislike them
    ['I love them', 'I like them', 'No strong feelings one way or the other', 'I dislike them', 'I wish they weren't on the show']
add Wilfrid to companions list
*/
Array.prototype.nand_arr = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
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
    for (let companion of companions) {
        ranks[companion] = $('.rank.'.concat(companion.replaceAll(' ', '_')))[0].value
        if (ranks[companion] == "NaN" || ranks[companion] == '0') {
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
function selected(){
    var ranks_all = JSON.parse(sessionStorage.all_ranks);
    var ranks_taken = [];
    for (let elem of $('.rank')) {
        if ($(elem).val() != '--') {
            ranks_taken.push(parseInt($(elem).val()));
        }
    }
    var avail_ranks = ranks_all.nand_arr(ranks_taken);
    avail_ranks.sort(function(a, b){return a - b});
    for (let elem of $('.rank')) {
        var sel = $(elem).val();
        if (sel != '--') {
            avail_ranks.push(sel);
            avail_ranks.sort(function(a, b){return a - b});
        }
        $(elem).find('option').remove().end()
        for (let rank of avail_ranks) {
            $(elem).append(new Option(rank, rank));
        }
        $(elem).val(sel);
        if (sel != '--') {
            avail_ranks.splice(avail_ranks.indexOf(sel), 1);
            avail_ranks.sort(function(a, b){return a - b});
        }
    }
}
function format_individual(elem) {
    var results = JSON.parse(sessionStorage.results)['individual'][$(elem.target).val()];
    var chart = $('.results.chart');
    $(chart).text('');
    for (var i=0;i<14;i++){
        $(chart).append($(document.createElement('DIV')).text(''.concat(i + 1, ' : ', results[i])));
    }
}
function format_results(results) {
    var chart = $('.results.chart');
    $(chart).text('');
    for (let companion of results){
        $(chart).append($(document.createElement('DIV')).text(companion));
    }
}
function format_IRV(elem) {
    var results = JSON.parse(sessionStorage.results)['instant runoff'][$(elem.target).val()];
    var chart = $('.results.chart');
    $(chart).text('');
    for (let companion of results){
        $(chart).append($(document.createElement('DIV')).text(companion));
    }
}
function display_results(elem){
    var results = JSON.parse(sessionStorage.results);
    switch ($(elem.target).val()) {
        case 'combination duel':
            $('.results.method.sub').hide();
            $('.explain.text').hide().text("Each companion was paired up in a test with every other companion to see which of the two people was people's favourite. They were then ranked from most to least match-ups won.");
            format_results(results['combination duel']);
            break;
        case 'individual':
            $('.results.method.sub').show();
            $('.explain.text').hide().text("Displays how many of people voted for this companion at each rank.");
            $('.results.chart').text('');
            $('.results.method.sub').change(format_individual).find('option').remove().end();
            for (let option of Object.keys(results['individual'])) {
                $('.results.method.sub').append(new Option(option, option));
            }
            break;
        case 'instant runoff':
            $('.results.method.sub').show();
            $('.explain.text').hide().text("It's 6:18AM and I haven't slept.").append("<a href=https://en.wikipedia.org/wiki/Instant-runoff_voting>Wikipedia has an article</a> and <a href=https://www.youtube.com/watch?v=3Y3jE3B8HsE>CGP Gray has a great video</a>");
            $('.results.chart').text('');
            $('.results.method.sub').change(format_IRV).find('option').remove().end();
            for (let option of Object.keys(results['instant runoff'])) {
                $('.results.method.sub').append(new Option(option, option));
            }
            break;
        case 'least hated':
            $('.results.method.sub').hide();
            $('.explain.text').hide().text("The lowest ranked companion was added to a list and then removed from the competition. The list was then reversed.");
            format_results(results['least hated']);
            break;
        case 'lowest aggregate':
            $('.results.method.sub').hide();
            $('.explain.text').hide().text("All companions ranks were added together to give them a total score. Lowest score wins on this one.");
            format_results(results['lowest aggregate']);
            break;
        case 'simple':
            $('.results.method.sub').hide();
            $('.explain.text').hide().text("Sorted by how many people ranked each companion as their favourite.");
            format_results(results['simple']);
            break;
        case 'mine':
            $('.results.method.sub').hide();
            $('.explain.text').hide().text("I remembered what ranks you submitted. These are them.");
            var a = JSON.parse(localStorage.submitted);
            b = [];
            for(i in a){b.push([i,parseInt(a[i])])}
            b.sort(function(a, b){return a[1] - b[1]});
            c = [];
            for (let i of b){c.push(i[0])};
            format_results(c);
            break;
    }
}
function explain_method(){
    $('.explain.text').show()
}
function rewrap(){
    $.get({
        dataType: 'json',
        url: 'var/dw2018_results.json',
        success: function(data) {
            sessionStorage.results = JSON.stringify(data);
            $('.explain.text').hide().text("Sorted by how many people ranked each companion as their favourite.");
            format_results(data['simple']);
        }
    });
    var wrapper_arr = $('.wrapper');
    $(wrapper_arr[0]).text('Ranking Method ').append($(document.createElement('SELECT')).addClass('results method').change(display_results)).append($(document.createElement('BR'))).append($(document.createElement('SELECT')).addClass('results method sub')).append($(document.createElement('SPAN')).addClass('results chart'));
    var ranking_method_arr = ["combination duel", "individual", "instant runoff", "least hated", "lowest aggregate", "simple"];
    if (localStorage.submitted !== undefined) {
        ranking_method_arr.push('mine');
    }
    for (let methd of ranking_method_arr) {
        $($('.results.method')[0]).append(new Option(methd, methd));
    }
    $($('.results.method')[0]).val('simple');
    $('.results.method.sub').hide();
    $(wrapper_arr[1]).find('button').text('Explain method').attr("onclick",'explain_method()').end().append($(document.createElement('DIV')).addClass('explain text').hide());
}
$(document).ready(function() {
    var companions = ["Amy Pond", "Bill Pots", "Clara Oswald", "Cptn Jack Harkness", "Donna Noble", "Graham OBrien", "Martha Jones", "Mickey Smith", "Nardole", "River Song", "Rory Pond", "Rose Tyler", "Ryan Sinclair", "Yasmin Khan"]
    sessionStorage.companions = JSON.stringify(companions);
    var all_ranks = ['--'];
    for (var i=1;i<=companions.length;i++){
        all_ranks.push(i);
    }
    sessionStorage.all_ranks = JSON.stringify(all_ranks);
    var wrapper_arr = $('.wrapper');
    if (Date.now() < 1546369200000) {
        $(wrapper_arr[0]).text('');
        for (let companion of companions) {
            $(wrapper_arr[0]).append($(document.createElement('DIV')).addClass(companion.replaceAll(' ', '_')).text(companion.concat(' ')).append($(document.createElement('SELECT')).addClass(companion.replaceAll(' ', '_').concat(' rank')).change(selected)));
        }
        if (localStorage.submitted !== undefined) {
            var submitted = JSON.parse(localStorage.submitted);
            for (var k in submitted) {
                $($('.rank.'.concat(k.replaceAll(' ', '_')))[0]).append(new Option(parseInt(submitted[k]), k));
            }
        }else {
            for (let rank of all_ranks) {
                $('select').append(new Option(rank, rank));
            }
        }
        var results_interval = setInterval(function(){
            if (Date.now() > 1546369200000){
                alert('Voting is now closed. Results will be displayed momentarily.');
                rewrap()
                clearInterval(results_interval);
            }
        }, 15000);
    } else {
        rewrap();
    }
});
