const core = require("@actions/core")
const exec = require("@actions/exec")

// FIXME: get this from the outputs of the flatpak-builder action
const LOCAL_REPO_NAME = "repo" 


const run = (repository, flatManagerUrl, token) => {
    exec.exec('flatpak', [
        'build-update-repo',
        '--generate-static-deltas',
        LOCAL_REPO_NAME,
    ])
    .then(async () => {
        const buildId = await exec.exec('flat-manager-client', [
            'create',
            flatManagerUrl,
            repository,
            '--token',
            token
        ])
        return buildId
    })
    .then(async (buildId) => {
        await exec.exec('flat-manager-client', [
            'push', 
            '--commit',
            '--publish',
            '--wait',
            '--token',
            token,        
            buildId,
            LOCAL_REPO_NAME,
        ])
        return buildId
    })
    .then(async (buildId) => {
        await exec.exec('flat-manager-client', [
            'purge',
            buildId,
        ])
    })
    .catch((err) => {
        core.setFailed(`Failed to publish the build: ${err}`)
    })
}

if (require.main === module) {
    run(
        core.getInput('repository'),
        core.getInput('flat-manager-url'),
        core.getInput('token')
    )
}