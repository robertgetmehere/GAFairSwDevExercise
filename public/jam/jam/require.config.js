var jam = {
    "packages": [
        {
            "name": "bootstrap",
            "location": "jam/bootstrap"
        }
    ],
    "version": "0.2.10",
    "shim": {}
};

if (typeof require !== "undefined" && require.config) {
    require.config({packages: jam.packages, shim: jam.shim});
}
else {
    var require = {packages: jam.packages, shim: jam.shim};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}