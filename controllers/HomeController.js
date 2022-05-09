
var moment = require('moment');
const { exec } = require('node:child_process')

exports.index = async (req, res, next) => {
    try {
        let data;
        let command = "certbot certificates";
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
            return;
            }
                // let text = "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - Found the following certs: Certificate Name: tcmv.cloud Domains: *.tcmv.cloud tcmv.cloud Expiry Date: 2022-08-03 09:22:16+00:00 (VALID: 89 days) Certificate Path: /etc/letsencrypt/live/tcmv.cloud/fullchain.pem Private Key Path: /etc/letsencrypt/live/tcmv.cloud/privkey.pem Certificate Name: therunway.co Domains: *.therunway.co therunway.co Expiry Date: 2022-08-04 06:19:43+00:00 (VALID: 89 days) Certificate Path: /etc/letsencrypt/live/therunway.co/fullchain.pem Private Key Path: /etc/letsencrypt/live/therunway.co/privkey.pem - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -";
                let res_stdout_str1 = JSON.stringify(stdout);
                let res_stdout_str2 = res_stdout_str1.replaceAll('\\n', '');

                let cut_start_pos = res_stdout_str2.indexOf("Certificate");
                let result1 = res_stdout_str2.slice(cut_start_pos - 0);
                let cut_end_pos = result1.lastIndexOf("privkey.pem");
                let result2 = result1.slice(0, cut_end_pos)+'privkey.pem';
                let result3 = result2.replaceAll('Certificate Name', 'MARK_Certificate Name');
                let result4 = result3.split('MARK_');
                result4.shift();

                let certs_arr = [];
                for (let index = 0; index < result4.length; index++) {
                    const element = result4[index];
                    // cert name
                    let name_start_pos = element.indexOf("Certificate Name: ");
                    let name_end_pos = element.indexOf(" Domains:");
                    let name_result1 = element.slice(name_start_pos, name_end_pos);
                    let name_result2 =  name_result1.replace('Certificate Name: ', '')
                    let cert_name = name_result2.replaceAll(' ', '');

                    // cert domain
                    let domain_start_pos = element.indexOf("Domains: ");
                    let domain_end_pos = element.indexOf(" Expiry Date:");
                    let domain_result1 = element.slice(domain_start_pos, domain_end_pos);
                    let domain_result2 =  domain_result1.replace('Domains: ', '')
                    let cert_domain_arr = domain_result2.split(' ');
                    let cert_domain = [];
                    for (let i = 0; i < cert_domain_arr.length; i++) {
                        const element = cert_domain_arr[i];
                        if (element !== '') {
                            cert_domain.push(element);
                        }
                    }

                    // cert expired date
                    let expired_date_start_pos = element.indexOf("Expiry Date: ");
                    let expired_date_end_pos = element.indexOf(" Certificate Path:");
                    let expired_date_result1 = element.slice(expired_date_start_pos, expired_date_end_pos);
                    let expired_date_result2 =  expired_date_result1.replace('Expiry Date: ', '')
                    let expired_date_result3 = expired_date_result2.replaceAll(' (VALID', 'MARK_(VALID');
                    let expired_date_result4 = expired_date_result3.split('MARK_');
                    let cert_expired_date = moment(expired_date_result4[0], 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
                    let cert_expired_time = moment(expired_date_result4[0], 'YYYY-MM-DD HH:mm:ssZZ').format('HH:mm:ssZZ');

                    // cert certificate path
                    let cert_path_start_pos = element.indexOf("Certificate Path: ");
                    let cert_path_end_pos = element.indexOf(" Private Key Path:");
                    let cert_path_result1 = element.slice(cert_path_start_pos, cert_path_end_pos);
                    let cert_path_result2 =  cert_path_result1.replace('Certificate Path: ', '')
                    let cert_path = cert_path_result2.replace(' ', '');

                    // cert private key path
                    let private_key_path_start_pos = element.indexOf("Private Key Path: ");
                    let private_key_path_result1 = element.slice(private_key_path_start_pos);
                    let private_key_path_result2 =  private_key_path_result1.replace('Private Key Path: ', '')
                    let private_key_path = private_key_path_result2.replace(' ', '');

                    let cert = {
                        name: cert_name,
                        domain: cert_domain,
                        expired: {
                            date: cert_expired_date,
                            time: cert_expired_time
                        },
                        certificate_path: cert_path,
                        private_key_path: private_key_path,

                    }
                    console.log(cert)
                    certs_arr.push(cert);
                }

                res.render('index', { title: 'Express', certs_arr: certs_arr });
        });

        
    } catch (error) {
        console.log(error);
    }
}

exports.create = async (req, res, next) => {
    try {
        
        res.render('create', { title: 'Express' });
        
    } catch (error) {
        console.log(error);
    }
}

exports.storeCert = async (req, res, next) => {
    try {
        let input = req.body;
        let domain = input.domain
        
        let command = 'sudo certbot certonly \
        --server https://acme-v02.api.letsencrypt.org/directory \
        --manual --preferred-challenges dns \
        -d *.'+ domain +' -d '+ domain

        console.log(command)
        
        await exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
            return;
            }
            let res_stdout = stdout;
            console.log(res_stdout)

        });
        res.render('create', { title: 'Express' });


    } catch (error) {
        console.log(error);
    }
}

exports.deleteCert = async (req, res, next) => {
    try {
        let input = req.body;
        let domain = input.domain
        
        let command1 = 'sudo rm -rf \
        /etc/letsencrypt/archive/'+ domain +' \
        /etc/letsencrypt/live/'+ domain;

        let command2 = 'sudo rm /etc/letsencrypt/renewal/'+ domain + '.conf';
        
        await exec(command1, async (error1, stdout1, stderr1) => {
            if (error1) {
                console.error(`exec error: ${error1}`);
            return;
            }
            console.log(stdout1)
            await exec(command2, async (error2, stdout2, stderr2) => {
                if (error2) {
                    console.error(`exec error: ${error2}`);
                return;
                }
                console.log(stdout2)

                res.redirect('/');
            });
        });


    } catch (error) {
        console.log(error);
    }
}