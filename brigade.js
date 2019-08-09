const { events, Job } = require("@brigadecore/brigadier");
const { Check, KindJob } = require("brigade-utils-test");

function e2e(e, project) {
    let kind = new KindJob("kind");
    kind.tasks.push(
        // "wget https://get.helm.sh/helm-v3.0.0-alpha.2-linux-amd64.tar.gz",
        // "tar -zxvf helm-v3.0.0-alpha.2-linux-amd64.tar.gz",
        // "mv linux-amd64/helm /go/bin/",
        // "helm init",
        // "helm repo add brigade https://brigadecore.github.io/charts",
        // "helm install brigade brigade/brigade",
        // "kubectl get pods --all-namespaces",
        // "wget https://github.com/brigadecore/brigade/releases/download/v1.1.0/brig-linux-amd64",
        // "mv ./brig-linux-amd64 bin/brig && chmod +x bin/brig"

        "cp $(kind get kubeconfig-path) /root/.kube/config",
        "cd src && mkdir github.com && cd github.com && mkdir deislabs && cd deislabs",
        "git clone https://github.com/deislabs/cnab-go",
        "cd cnab-go",
        "make bootstrap",
        "make integration-test"
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
