function similarMatchesStringify(matches) {
    if (matches.length > 1) {
        const list = matches.slice(1).map(function(e){
            const name = e.name;
            const id = e.id;
            const info = name + ' [' + id + ']';
            return info;
        }).join(", ");
        return list;
    }
}

function similarMatchesStringifyNoSlice(matches) {
    if (matches.length > 1) {
        const list = matches.map(function(e){
            const name = e.name;
            const id = e.id;
            const info = name + ' [' + id + ']';
            return info;
        }).join(", ");
        return list;
    }
}

function similarMatchesArray(matches){
    if(matches.length > 1){
        const matchesArray = matches.slice(1, 26);
        return matchesArray;
    }
}

module.exports = { similarMatchesStringify, similarMatchesStringifyNoSlice, similarMatchesArray }