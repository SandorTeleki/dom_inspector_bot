
function similarMatches(things) {
    if (things.length > 1) {
        return `Other matches:\n${things.slice(1).map(function(e){return e.name}).join(", ")}`
    }
}

module.exports = { similarMatches }