function similarMatches(things) {
    if (things.length > 1) {
        const list = things.slice(1).map(function(e){
            const name = e.name;
            const id = e.id;
            const info = name + ' [' + id + ']';
            return info;
        }).join(", ");
        return `Other matches [ID#]:\n${list}`;
    }
}

module.exports = { similarMatches }