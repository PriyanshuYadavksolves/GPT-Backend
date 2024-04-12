module.exports = ({ username,url }) => {
    return `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
            <div class="" style=" max-width: 580px; margin: 0px auto; border-radius: 10px;">
                <span class="" style=" font-size: 40px; display: block; padding: 10px;
        text-align: center;background: #EB4747;
        ">
                    <img
                        src="https://res.cloudinary.com/mailmodo/image/upload/v1658131947/editor/p/2c28dec6-c21c-4385-a91f-96e9a90c404f/d837cca5ebd76fbe268015bd9fe51b07_fu78lk.png"
                        width="70px"
                        style="display: inline; vertical-align: middle;"
                        alt=""
                    >
                </span>
                <div style="margin: 20px;  font-family:sans-serif; padding-bottom: 20px;">
                    <span style="font-weight: bold;font-size: 16px;
        font-weight: bold;
        font-family: sans-serif;
        font-size: 40px; display: block;
        ">Email verification</span>
    
                    <p>Hi <span style="font-weight: bold;">${username}</span> </p>
                    <p style="text-align: center; padding-bottom: 10px;"> 
                        You're almost set to start enjoying Tridium's Blog. Simply click the link below to verify your email address and get started</p>
    
                    <a href="${url}" style="text-decoration: none; text-align: center; display: block; width: 200px; margin: 10px auto; padding: 10px 20px; background: #EB4747; color: white; font-weight: bold; border-radius: 5px;">Verify your email address</a>
                    
                </div>
                <hr> 
    
            </div>
        </body>
    </html>
    `
  };
  