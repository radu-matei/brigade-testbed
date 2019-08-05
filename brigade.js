const { events, Job } = require("@brigadecore/brigadier");
const { Check, Kind } = require("brigade-utils-test");

const projectName = "brigade-utils";
const jsImg = "alpine";


function build(event, project) {
    var build = new Job(`${projectName}-build`, jsImg);

    build.tasks = [
        "cd src/",
        "cat brigade.js"
    ];

    return build;
}

function e2e(event, project) {
    var kind = new Kind();
    kind.job.tasks.push("kubectl get pods --all-namespaces");

    return kind;
}


// Here we can add additional Check Runs, which will run in parallel and
// report their results independently to GitHub
function runSuite(e, p) {
    // For the master branch, we build and publish images in response to the push
    // event. We test as a precondition for doing that, so we DON'T test here
    // for the master branch.
    if (e.revision.ref != "master") {
        // Important: To prevent Promise.all() from failing fast, we catch and
        // return all errors. This ensures Promise.all() always resolves. We then
        // iterate over all resolved values looking for errors. If we find one, we
        // throw it so the whole build will fail.
        //
        // Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all#Promise.all_fail-fast_behaviour
        //
        // Note: as provided language string is used in job naming, it must consist
        // of lowercase letters and hyphens only (per Brigade/K8s restrictions)
        return Promise.all([
            runTests(e, p, build).catch((err) => { return err }),
            runTests(e, p, e2e).catch((err) => { return err }),
        ])
            .then((values) => {
                values.forEach((value) => {
                    if (value instanceof Error) throw value;
                });
            });
    }
}

// runTests is a Check Run that is run as part of a Checks Suite
function runTests(e, p, jobFunc) {
    console.log("Check requested");

    var check = new Check(e, p, jobFunc());
    return check.run();
}

events.on("check_suite:requested", runSuite);
events.on("check_suite:rerequested", runSuite);
events.on("exec", runSuite);