module.exports.test = function test(testNumber) {
    if (testNumber === 1) {
        return true;
    }

    if (false) {
        return "never get here";
    }

    if (true === false) {
        return "never get here";
    }

    console.log("notNull");

    const test = 0;
