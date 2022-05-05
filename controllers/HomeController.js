
const { exec } = require('node:child_process')

exports.index = async (req, res, next) => {
    try {

        exec('ls', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                console.log('1======')
            return;
            }
                // console.log(`stdout: ${stdout}`);
                // console.log('2======')
                // console.error(`stderr: ${stderr}`);
                let data = JSON.stringify(stdout);
                console.log(data)

        });

        res.render('index', { title: 'Express', data: data });
    } catch (error) {
        console.log(error);
    }
}