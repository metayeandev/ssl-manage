
const { exec } = require('node:child_process')

exports.index = async (req, res, next) => {
    try {
        let data;
        let command = "certbot certificates";
        exec('command', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
            return;
            }
                // console.log(`stdout: ${stdout}`);
                // console.log('2======')
                // console.error(`stderr: ${stderr}`);
                data = JSON.stringify(stdout);
                console.log(data)
        });

        res.render('index', { title: 'Express', data: data });
    } catch (error) {
        console.log(error);
    }
}