const { events, Job } = require("@brigadecore/brigadier");
const { Check } = require("@brigadecore/brigade-utils");

const projectName = "brigade-utils";
const jsImg = "node:12.3.1-stretch";


function build(e, project) {
    var build = new Job(`${projectName}-build`, jsImg);

    build.tasks = [
        "echo this works"
    ];

    return build;

}

function runSuite(e, p) {
    var check = new Check(e, p, build());
    check.run();
}

events.on("check_suite:requested", runSuite);
events.on("check_suite:rerequested", runSuite);
events.on("exec", runSuite);