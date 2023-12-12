function similarMatches(things) {
    if (things.length > 1) {
        return `Other matches:\n${things.slice(1).map(function(e){
            const name = e.name;
            const id = e.id;
            const info = name + ' [ID: ' + id + ']';
            return info;
        }).join(", ")}`
    }
}

module.exports = { similarMatches }