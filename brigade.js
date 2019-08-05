const { events, Job } = require("@brigadecore/brigadier");
const { Check, KindJob } = require("brigade-utils-test");

const projectName = "brigade-utils";
const jsImg = "node:12.3.1-stretch";


function e2e(e, project) {
    let kind = new KindJob("kind");
    kind.tasks.push(
        "wget https://get.helm.sh/helm-v3.0.0-alpha.2-linux-amd64.tar.gz",
        "tar -zxvf helm-v3.0.0-alpha.2-linux-amd64.tar.gz",
        "mv linux-amd64/helm /go/bin/",
        "helm init",
        "helm repo update",
        "helm install my-redis stable/redis",
        "sleep 150",
        "kubectl get pods --all-namespaces"
    );

    return kind;
}

function runSuite(e, p) {
    var check = new Check(e, p, e2e());
    check.run();
}

events.on("check_suite:requested", runSuite);
events.on("check_suite:rerequested", runSuite);
events.on("exec", runSuite);
