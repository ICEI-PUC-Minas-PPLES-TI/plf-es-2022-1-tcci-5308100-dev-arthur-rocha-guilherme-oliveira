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

    console.log("notNull");

    if (false) {
        return "never get here";
    }

    if (true === false) {
        console.log("notNull");

        return "never get here";
    }

    if (testNumber === 2) {
        return false;
    }

    if (testNumber === 3) return "notNull";
    if (testNumber === 4) return "reallyNull";

    testObj = {
        attr1: true,
        attr2: true,
        attr3: true
    };
    if (testObj.attr1 && testObj.attr2 && callbackBased(testNumber, subTest)) {
        testNumber = testNumber ? subTest(testNumber) : "neverhappen";
        testNumber = testNumber ? subTest(testNumber) : "neverhappen";
        testNumber = testNumber ? subTest(testNumber) : "neverhappen";
    }

    testNumber = testNumber === 5 ? "woop" : "wap";

    const testComplexReturn = callbackBased(111, subTest);

    return testNumber;
}

function callbackBased(testNumber, done) {
    return done(testNumber.toString());
}

function subTest(testString) {
    testString = testString.toString();
    return testString.toUpperCase();
}