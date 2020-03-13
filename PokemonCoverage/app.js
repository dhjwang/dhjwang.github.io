function getthem(){
    //reset states
    document.querySelector(".suggest").textContent = ''

    var myNode = document.getElementById("showmons");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    var test2 = document.getElementById('containers'); 

    while (test2.firstChild) {
        test2.removeChild(test2.firstChild);
    }

    // obtaining team indexes in database
    var team = []
    var teamids =[]
    for (i = 0; i<6; i++) {
        var tmp = Object.keys(BattlePokedex).filter(x => (BattlePokedex[x].species == $('.typeahead.tt-input')[i].value.trim()))
        if (tmp.length){
            let modal = $('#pokemon .typeahead')[(i*2)+1];
            modal.style['border-bottom'] = '2px solid black';
            team.push($('.typeahead.tt-input')[i].value);
            teamids.push(tmp);            
        } else{
            let modal = $('#pokemon .typeahead')[(i*2)+1];
            modal.style["border-bottom"] = '2px solid rgb(238, 228, 228)';            
        }
    }
    // getting team types from the indexes
    var teamtypes = []
    teamids.forEach(x => {if (BattlePokedex[x] != null){
        types = BattlePokedex[x].types;
        if (effectiveness[types] == null){
                    teamtypes.push(effectiveness[types.reverse()])
                } else {
                    teamtypes.push(effectiveness[types])
                }
    }});

    
    if (teamtypes.length) {
        // checking what types are not covered
        var graphtypes = []
        graphtypes.length = 18;
        graphtypes.fill(0);
        var lacking =[] 
        var i = 0;
        Object.keys(teamtypes[0]).forEach(function(x){
        if (!teamtypes.some(mon => mon[x] < 1)){
            lacking.push(x)
        } else {
            teamtypes.forEach(function(mon){
                if(mon[x] < 1){
                    graphtypes[i] ++;
                }
            })
        }
        i++;
        })
       
        test = document.getElementById('containers'); 
        for (let i = 0; i<18;i++){
            var newElement = document.createElement('div');
            newElement.id = Object.keys(teamtypes[0])[i]; 
            newElement.className = "type";
            test.appendChild(newElement);
        }    
        meep = document.getElementsByClassName('type')
        for (x of meep){
            var newElement = document.createElement('div');
            newElement.className = 'bars';
            x.appendChild(newElement);

            var newElement = document.createElement('div');
            newElement.className = 'typedesc';
            newElement.innerHTML = x.id;
            x.appendChild(newElement);
        }

        deep = document.getElementsByClassName('bars')
        var i = 0;
        for (x of deep){
            let newElement = document.createElement('div');
            newElement.className = graphtypes[i];
            x.appendChild(newElement);
            i++;
        }


        if (!lacking.length){
            document.querySelector(".suggest").textContent = 'The team of '.concat(team.join(', '),' covers all types!')
        } else {
            // remove nonexistent types
            unuseable = []
            Object.keys(effectiveness).forEach(function(x){
                var tmp = Object.keys(BattlePokedex).slice(0,1126).filter(y => BattlePokedex[y].types == x || BattlePokedex[y].types == x.split(',').reverse().join(','))
                if (!tmp.length) {
                    unuseable.push(x);
                }
            })
            efflist = Object.keys(effectiveness).filter(x => !unuseable.includes(x))

            // find best types to add
            var maxarray =[]
            var adders =[]
            efflist.forEach(function(x){
                var count = 0
                lacking.forEach(function(y){
                    if (effectiveness[x][y] < 1) {count ++} 
                })
                maxarray.push(count) 
            })
            for (i = 0; i< maxarray.length;i++){
                if (maxarray[i] == Math.max(...maxarray)){
                    adders.push(efflist[i])
                }
            }    
            document.querySelector(".suggest").textContent = 'Consider adding these types: '
            
            
            // display Pokemon that are a given type
            function getmons(event){
                let montypes = event.target.value;
                while (myNode.firstChild) {
                    myNode.removeChild(myNode.firstChild);
                }

                var signal = [];
                // check if team is full to replace mons
                if (team.length == 6){
                    let typesize = graphtypes.reduce((accu,curr)=> (curr!==0) ? accu+1:accu,0);
                    teamtypes.push(effectiveness[montypes])
                    for (let i=0;i<6;i++){
                        let tmp = teamtypes.slice(0)
                        tmp.splice(i,1)
                        let tmptypes = []
                        Object.keys(tmp[0]).forEach(function(x){
                            if (tmp.some(mon => mon[x] < 1)){
                                tmptypes.push(1)
                            }
                        })
                        if (tmptypes.reduce((accu,curr)=> accu+curr,0) == 18){
                            typesize = 17;
                        }
                        if (tmptypes.reduce((accu,curr)=> accu+curr,0) > typesize){
                            signal.push(team[i])
                        }
                    }
                }

                if (team.length == 6){
                    document.querySelector(".suggest").setAttribute('style','white-space: pre;')
                    document.querySelector(".suggest").textContent = 'Consider replacing:\r\n' + signal.join('  |  ')
                } else {
                    document.querySelector(".suggest").textContent = montypes.concat(' type Pokemon: ')
                }

                var suggestions = []
                Object.keys(BattlePokedex).slice(0,1126).filter(y => BattlePokedex[y].types == montypes || BattlePokedex[y].types == montypes.split(',').reverse().join(',')).forEach(function(mon){
                    suggestions.push(BattlePokedex[mon].species)
                })
                suggestions.forEach(function(x){
                    function addnew(event){
                        for (let i =0; i<6;i++){
                            let modal = $('#pokemon .typeahead')[(i*2)+1];
                            if (modal.style["border-bottom"] == '2px solid rgb(238, 228, 228)' |
                            $('.typeahead.tt-input')[i].value == ''){
                                $('.typeahead.tt-input')[i].value = event.target.value;
                                break
                            }          
                        }
                    }
                    let ele = document.createElement('button');
                    ele.textContent =x;
                    ele.value = x;
                    ele.className = 'newmon'
                    ele.addEventListener('click',addnew)
                    document.getElementById('showmons').appendChild(ele);
                })
            }
            
            // create options of types to add
            adders.forEach(function(x){
                ele = document.createElement('button');
                ele.textContent =x;
                ele.value = x;
                ele.className = 'suggested-type'
                ele.addEventListener('click',getmons)
                document.getElementById('showmons').appendChild(ele);
            })  
        }
    } else {
        document.querySelector(".suggest").textContent = 'Enter a team!'
    }
}


// add: ability related coverage
// add: recommend strong / full evo pokemon (base stats)


 var pokemon = Object.keys(BattlePokedex).map(function(x) { return BattlePokedex[x].species });

 var pokemon = new Bloodhound({
   datumTokenizer: Bloodhound.tokenizers.whitespace,
   queryTokenizer: Bloodhound.tokenizers.whitespace,
   local: pokemon
 });

 $('#pokemon .typeahead').typeahead({
     hint: true,
     highlight: true,
     minLength: 1
     },
 {
     name: 'pokemon',
     source: pokemon
 });

