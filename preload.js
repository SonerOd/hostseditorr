const $ = require('jquery');
const fs = require('fs');
const readline = require('readline')

async function readHostsLineByLine(file) {
    const fileStream = fs.createReadStream(file);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    const returnArr = [];
    for await (const line of rl) {
        if(line.includes("	") && !line.includes("#loopback")){
            returnArr.push(line.split('	'));
        }
    }
    return returnArr;
}

window.onload = () => {
    readHostsLineByLine('/etc/hosts').then(r => {
        $.each(r, function(x,y){
            $('#rows').append('\n' +
                '<tr>\n' +
                '    <td>'+(x+1)+'</td>\n' +
                '    <td><input class="form-control" required name="ip" value="'+y[0]+'"></td>\n' +
                '    <td><input class="form-control" required name="domain" value="'+y[1]+'"></td>\n' +
                '    <td><button type="button" class="btn btn-danger lineBtn" onClick="removeMe(this);">&times;</button></td>\n' +
                '</tr>')
        });
    });
}
