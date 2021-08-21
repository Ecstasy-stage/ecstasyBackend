const nodemailer = require('nodemailer')
const sgMail = require('@sendgrid/mail')

require('dotenv').config()

const api = `${process.env.SENDGRID_API_KEY}`
sgMail.setApiKey(api)


//========================================================


// Creating transport for feedback and report email...
const feedbackTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.FEEDBACK_EMAIL,
        pass: process.env.FEEDBACK_EMAIL_PASSWORD
    }
})

// const transport = nodemailer.createTransport({
//   service: 'gmail',
//   secure: false,
//   auth: {
//     user: 'ecstasyfeedback@gmail.com',
//     pass: '6icowgh#1Ecstasy',
//   }
// })

//=================send feedback email=========================

const sendFeedbackEmail = async (userName, userEmail, feedback) => {
    try {

        const emailOptions = {
            from: process.env.FEEDBACK_EMAIL,
            to: process.env.FEEDBACK_EMAIL,
            subject: "Ecstasy Feedback",
            html: `<p>User Name: <span style="font-weight: bold">${userName}</span></p>
                <p>Email: <span style="font-weight: bold">${userEmail}</span></p>
                <h4>Feedback: ${feedback}</h4>`
        }

        feedbackTransport.sendMail(emailOptions, (err, info) => {
            if(err) {
                console.log(err);
            } else {
                console.log(info);
            }
        })

    } catch (err) {
        console.log(err);
    }
};

//=================================================================


//=====================send report email==========================

const sendReportEmail = async (userName, userEmail, videoURL, reportMSG) => {
    
    try {
        
        const emailOptions = {
            from: process.env.FEEDBACK_EMAIL,
            to: process.env.FEEDBACK_EMAIL,
            subject: "Ecstasy Video Report",
            html: `<h4>User Name: ${userName}</h4>
                <h4>User Email: ${userEmail}</h4>
                <h4>Video URL: ${videoURL}</h4>
                <h4>Report Message: ${reportMSG}</h4>`
        }

        feedbackTransport.sendMail(emailOptions, (err, info) => {
            if(err) {
                console.log(err);
            } else {
                console.log(info);
            }
        })

    } catch (error) {
        console.log(error);
    }
    
};

//===================================================================


//==============send email on successfull login for first time======================

const sendLoginSuccessEmail = (email, userName) => {

    const msg = {
        from: `Ecstasy <${process.env.EMAIL}>`,
        to: email,
        subject: "Welcome to Ecstasy",
        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
        <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
        
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=Edge">
            <!--<![endif]-->
            <!--[if (gte mso 9)|(IE)]>
              <xml>
                <o:OfficeDocumentSettings>
                  <o:AllowPNG/>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
              </xml>
              <![endif]-->
            <!--[if (gte mso 9)|(IE)]>
          <style type="text/css">
            body {width: 600px;margin: 0 auto;}
            table {border-collapse: collapse;}
            table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}
            img {-ms-interpolation-mode: bicubic;}
          </style>
        <![endif]-->
            <style type="text/css">
                body,
                p,
                div {
                    font-family: arial, helvetica, sans-serif;
                    font-size: 14px;
                }
        
                body {
                    color: #000000;
                }
        
                body a {
                    color: #1188E6;
                    text-decoration: none;
                }
        
                p {
                    margin: 0;
                    padding: 0;
                }
        
                table.wrapper {
                    width: 100% !important;
                    table-layout: fixed;
                    -webkit-font-smoothing: antialiased;
                    -webkit-text-size-adjust: 100%;
                    -moz-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                }
        
                img.max-width {
                    max-width: 100% !important;
                }
        
                .column.of-2 {
                    width: 50%;
                }
        
                .column.of-3 {
                    width: 33.333%;
                }
        
                .column.of-4 {
                    width: 25%;
                }
        
                ul ul ul ul {
                    list-style-type: disc !important;
                }
        
                ol ol {
                    list-style-type: lower-roman !important;
                }
        
                ol ol ol {
                    list-style-type: lower-latin !important;
                }
        
                ol ol ol ol {
                    list-style-type: decimal !important;
                }
        
                @media screen and (max-width:480px) {
        
                    .preheader .rightColumnContent,
                    .footer .rightColumnContent {
                        text-align: left !important;
                    }
        
                    .preheader .rightColumnContent div,
                    .preheader .rightColumnContent span,
                    .footer .rightColumnContent div,
                    .footer .rightColumnContent span {
                        text-align: left !important;
                    }
        
                    .preheader .rightColumnContent,
                    .preheader .leftColumnContent {
                        font-size: 80% !important;
                        padding: 5px 0;
                    }
        
                    table.wrapper-mobile {
                        width: 100% !important;
                        table-layout: fixed;
                    }
        
                    img.max-width {
                        height: auto !important;
                        max-width: 100% !important;
                    }
        
                    a.bulletproof-button {
                        display: block !important;
                        width: auto !important;
                        font-size: 80%;
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                    }
        
                    .columns {
                        width: 100% !important;
                    }
        
                    .column {
                        display: block !important;
                        width: 100% !important;
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                        margin-left: 0 !important;
                        margin-right: 0 !important;
                    }
        
                    .social-icon-column {
                        display: inline-block !important;
                    }
                }
            </style>
            <!--user entered Head Start-->
            <!--End Head user entered-->
        </head>
        
        <body>
            <center class="wrapper" data-link-color="#1188E6"
                data-body-style="font-size:14px; font-family:arial,helvetica,sans-serif; color:#000000; background-color:#FFFFFF;">
                <div class="webkit">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#FFFFFF">
                        <tr>
                            <td valign="top" bgcolor="#FFFFFF" width="100%">
                                <table width="100%" role="content-container" class="outer" align="center" cellpadding="0"
                                    cellspacing="0" border="0">
                                    <tr>
                                        <td width="100%">
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td>
                                                        <!--[if mso]>
            <center>
            <table><tr><td width="600">
          <![endif]-->
                                                        <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                                            style="width:100%; max-width:600px;" align="center">
                                                            <tr>
                                                                <td role="modules-container"
                                                                    style="padding:0px 0px 0px 0px; color:#000000; text-align:left;"
                                                                    bgcolor="#FFFFFF" width="100%" align="left">
                                                                    <table class="module preheader preheader-hide" role="module"
                                                                        data-type="preheader" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
                                                                        <tr>
                                                                            <td role="module-content">
                                                                                <p></p>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                    <table border="0" cellpadding="0" cellspacing="0"
                                                                        align="center" width="100%" role="module"
                                                                        data-type="columns" style="padding:0px 0px 0px 0px;"
                                                                        bgcolor="#7dd6ff" data-distribution="1">
                                                                        <tbody>
                                                                            <tr role="module-content">
                                                                                <td height="100%" valign="top">
                                                                                    <table width="580"
                                                                                        style="width:580px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;"
                                                                                        cellpadding="0" cellspacing="0"
                                                                                        align="left" border="0" bgcolor=""
                                                                                        class="column column-0">
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td
                                                                                                    style="padding:0px;margin:0px;border-spacing:0;">
                                                                                                    <table class="module"
                                                                                                        role="module"
                                                                                                        data-type="text"
                                                                                                        border="0"
                                                                                                        cellpadding="0"
                                                                                                        cellspacing="0"
                                                                                                        width="100%"
                                                                                                        style="table-layout: fixed;"
                                                                                                        data-muid="0d82e748-699d-4135-b799-9b1270108f0f"
                                                                                                        data-mc-module-version="2019-10-22">
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td style="padding:8px 8px 4px 8px; line-height:22px; text-align:inherit; background-color:#000000;"
                                                                                                                    height="100%"
                                                                                                                    valign="top"
                                                                                                                    bgcolor="#000000"
                                                                                                                    role="module-content">
                                                                                                                    <div>
                                                                                                                        <div
                                                                                                                            style="font-family: inherit; text-align: center">
                                                                                                                            <span
                                                                                                                                style="font-size: 22px; color: #7dd6ff"><strong>Welcome
                                                                                                                                    to
                                                                                                                                    Ecstasy</strong></span>
                                                                                                                        </div>
                                                                                                                        <div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                    <table class="module"
                                                                                                        role="module"
                                                                                                        data-type="text"
                                                                                                        border="0"
                                                                                                        cellpadding="0"
                                                                                                        cellspacing="0"
                                                                                                        width="100%"
                                                                                                        style="table-layout: fixed;"
                                                                                                        data-muid="2aae3c9b-2b12-4efb-b0f8-5d321309dda7.1"
                                                                                                        data-mc-module-version="2019-10-22">
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td style="padding:28px 0px 18px 0px; line-height:2px; text-align:inherit;"
                                                                                                                    height="100%"
                                                                                                                    valign="top"
                                                                                                                    bgcolor=""
                                                                                                                    role="module-content">
                                                                                                                    <div>
                                                                                                                        <div
                                                                                                                            style="font-family: inherit; text-align: center">
                                                                                                                            <span
                                                                                                                                style="font-size: 18px">Hello
                                                                                                                            </span><span
                                                                                                                                style="font-size: 18px"><strong>${userName}</strong></span>
                                                                                                                        </div>
                                                                                                                        <div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                    <table class="wrapper"
                                                                                                        role="module"
                                                                                                        data-type="image"
                                                                                                        border="0"
                                                                                                        cellpadding="0"
                                                                                                        cellspacing="0"
                                                                                                        width="100%"
                                                                                                        style="table-layout: fixed;"
                                                                                                        data-muid="c576953b-45e7-4d30-8db3-6ecbe8d65480">
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td style="font-size:6px; line-height:10px; padding:10px 30px 10px 30px;"
                                                                                                                    valign="top"
                                                                                                                    align="center">
                                                                                                                    <img class="max-width"
                                                                                                                        border="0"
                                                                                                                        style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:70% !important; width:70%; height:auto !important;"
                                                                                                                        width="NaN"
                                                                                                                        alt="Ecstasy Logo"
                                                                                                                        data-proportionally-constrained="true"
                                                                                                                        data-responsive="true"
                                                                                                                        src="http://cdn.mcauto-images-production.sendgrid.net/343d77f11207ddc3/c3c3e641-048c-498d-aea8-d2ddeb9e619a/407x297.jpeg">
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                    <table class="module"
                                                                                                        role="module"
                                                                                                        data-type="text"
                                                                                                        border="0"
                                                                                                        cellpadding="0"
                                                                                                        cellspacing="0"
                                                                                                        width="100%"
                                                                                                        style="table-layout: fixed;"
                                                                                                        data-muid="a4a17632-f69c-4f88-8439-f2d92dfbb7c5"
                                                                                                        data-mc-module-version="2019-10-22">
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td style="padding:18px 0px 18px 0px; line-height:4px; text-align:inherit;"
                                                                                                                    height="100%"
                                                                                                                    valign="top"
                                                                                                                    bgcolor=""
                                                                                                                    role="module-content">
                                                                                                                    <div>
                                                                                                                        <div
                                                                                                                            style="font-family: inherit; text-align: center">
                                                                                                                            <span
                                                                                                                                style="font-size: 18px"><strong>Yardstick
                                                                                                                                    of
                                                                                                                                    Creative
                                                                                                                                    Illusion</strong></span>
                                                                                                                        </div>
                                                                                                                        <div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                    <table class="module"
                                                                                                        role="module"
                                                                                                        data-type="text"
                                                                                                        border="0"
                                                                                                        cellpadding="0"
                                                                                                        cellspacing="0"
                                                                                                        width="100%"
                                                                                                        style="table-layout: fixed;"
                                                                                                        data-muid="52f59308-5b85-4952-b2f5-eda2797bac35"
                                                                                                        data-mc-module-version="2019-10-22">
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td style="padding:12px 8px 12px 8px; line-height:22px; text-align:inherit; background-color:#7dd6ff;"
                                                                                                                    height="100%"
                                                                                                                    valign="top"
                                                                                                                    bgcolor="#7dd6ff"
                                                                                                                    role="module-content">
                                                                                                                    <div>
                                                                                                                        <div
                                                                                                                            style="font-family: inherit; text-align: center">
                                                                                                                            <span
                                                                                                                                style="font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; caret-color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px; background-color: rgb(125, 214, 255); float: none; display: inline; color: #000000">A
                                                                                                                                Cultural
                                                                                                                                App
                                                                                                                                platform
                                                                                                                                for
                                                                                                                                Artists
                                                                                                                                to
                                                                                                                                innovate
                                                                                                                                the
                                                                                                                                horizons
                                                                                                                                of
                                                                                                                                creativity
                                                                                                                                through
                                                                                                                                aesthetic
                                                                                                                                video
                                                                                                                                art
                                                                                                                                and
                                                                                                                                Social
                                                                                                                                App
                                                                                                                                platform
                                                                                                                                for
                                                                                                                                Audience
                                                                                                                                to
                                                                                                                                get
                                                                                                                                Entertained,
                                                                                                                                make
                                                                                                                                friends
                                                                                                                                and
                                                                                                                                socialise
                                                                                                                                through
                                                                                                                                video
                                                                                                                                information.</span>
                                                                                                                        </div>
                                                                                                                        <div
                                                                                                                            style="font-family: inherit; text-align: center">
                                                                                                                            <span
                                                                                                                                style="color: #000000"><br>
                                                                                                                            </span><span
                                                                                                                                style="font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; caret-color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px; background-color: rgb(125, 214, 255); float: none; display: inline; color: #000000">Forming
                                                                                                                                a
                                                                                                                                collaborative
                                                                                                                                framework
                                                                                                                                between
                                                                                                                                Artists
                                                                                                                                who
                                                                                                                                has
                                                                                                                                something
                                                                                                                                incredible
                                                                                                                                to
                                                                                                                                show
                                                                                                                                and
                                                                                                                                Audience
                                                                                                                                who
                                                                                                                                wants
                                                                                                                                to
                                                                                                                                watch
                                                                                                                                something
                                                                                                                                incredible
                                                                                                                                and
                                                                                                                                recommend
                                                                                                                                it
                                                                                                                                to
                                                                                                                                their
                                                                                                                                family
                                                                                                                                &amp;
                                                                                                                                friends
                                                                                                                                seamlessly
                                                                                                                                at
                                                                                                                                one
                                                                                                                                place.</span><span
                                                                                                                                style="color: #000000"><br>
                                                                                                                            </span>
                                                                                                                        </div>
                                                                                                                        <div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                    <table class="module"
                                                                                                        role="module"
                                                                                                        data-type="text"
                                                                                                        border="0"
                                                                                                        cellpadding="0"
                                                                                                        cellspacing="0"
                                                                                                        width="100%"
                                                                                                        style="table-layout: fixed;"
                                                                                                        data-muid="8d0451b4-9941-4da2-9c84-ddff77785848"
                                                                                                        data-mc-module-version="2019-10-22">
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td style="padding:18px 10px 18px 10px; line-height:20px; text-align:inherit;"
                                                                                                                    height="100%"
                                                                                                                    valign="top"
                                                                                                                    bgcolor=""
                                                                                                                    role="module-content">
                                                                                                                    <div>
                                                                                                                        <div
                                                                                                                            style="font-family: inherit; text-align: inherit">
                                                                                                                            <span
                                                                                                                                style="color: #000000; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; caret-color: rgba(0, 0, 0, 0.9); background-color: rgb(125, 214, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; font-size: 14px; font-family: arial, helvetica, sans-serif"><strong>To
                                                                                                                                    us,
                                                                                                                                    he
                                                                                                                                    bequeathed
                                                                                                                                    his
                                                                                                                                    tragedies
                                                                                                                                    and
                                                                                                                                    comedies,
                                                                                                                                    his
                                                                                                                                    sonnets
                                                                                                                                    and
                                                                                                                                    verse,
                                                                                                                                    which
                                                                                                                                    would
                                                                                                                                    survive
                                                                                                                                    400
                                                                                                                                    years</strong></span><span
                                                                                                                                style="font-size: 14px; font-family: arial, helvetica, sans-serif">&nbsp;</span>
                                                                                                                        </div>
                                                                                                                        <div
                                                                                                                            style="font-family: inherit; text-align: right">
                                                                                                                            <span
                                                                                                                                style="font-size: 14px; font-family: arial, helvetica, sans-serif"><strong>~William
                                                                                                                                    Shakespeare</strong></span>
                                                                                                                        </div>
                                                                                                                        <div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                    <table class="module"
                                                                                                        role="module"
                                                                                                        data-type="text"
                                                                                                        border="0"
                                                                                                        cellpadding="0"
                                                                                                        cellspacing="0"
                                                                                                        width="100%"
                                                                                                        style="table-layout: fixed;"
                                                                                                        data-muid="c2da6531-27b1-4bf3-bec3-0fd7262cc65e"
                                                                                                        data-mc-module-version="2019-10-22">
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td style="padding:18px 0px 18px 0px; line-height:22px; text-align:inherit;"
                                                                                                                    height="100%"
                                                                                                                    valign="top"
                                                                                                                    bgcolor=""
                                                                                                                    role="module-content">
                                                                                                                    <div>
                                                                                                                        <div
                                                                                                                            style="font-family: inherit; text-align: center">
                                                                                                                            <span
                                                                                                                                style="font-size: 16px"><strong>Let's
                                                                                                                                    change
                                                                                                                                    the
                                                                                                                                    way
                                                                                                                                    we
                                                                                                                                    get
                                                                                                                                    entertained</strong></span>
                                                                                                                        </div>
                                                                                                                        <div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                    <table class="module"
                                                                                                        role="module"
                                                                                                        data-type="text"
                                                                                                        border="0"
                                                                                                        cellpadding="0"
                                                                                                        cellspacing="0"
                                                                                                        width="100%"
                                                                                                        style="table-layout: fixed;"
                                                                                                        data-muid="6ee5e8bc-0e3c-4a35-a8c1-ce12dce883af"
                                                                                                        data-mc-module-version="2019-10-22">
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td style="padding:10px 10px 18px 30px; line-height:22px; text-align:inherit;"
                                                                                                                    height="100%"
                                                                                                                    valign="top"
                                                                                                                    bgcolor=""
                                                                                                                    role="module-content">
                                                                                                                    <div>
                                                                                                                        <div
                                                                                                                            style="font-family: inherit; text-align: inherit">
                                                                                                                            <span
                                                                                                                                style="font-size: 16px"><strong>Ecstasy
                                                                                                                                    Team</strong></span>
                                                                                                                        </div>
                                                                                                                        <div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                </td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                        <!--[if mso]>
                                          </td>
                                        </tr>
                                      </table>
                                    </center>
                                    <![endif]-->
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
            </center>
        </body>
        
        </html>`
    }

   
    sgMail.send(msg)
    .then(() => {
        console.log('email sent');
    })
    .catch(err => {
        console.log(err);
    })
}


const sendFriendRequestEmail = (email, userName, friendName, friendUrl) => {
    const msg = {
        from: `Ecstasy <${process.env.EMAIL}>`,
        to: email,
        subject: "New Friend Request",
        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
        <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
            <head>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
              <!--[if !mso]><!-->
              <meta http-equiv="X-UA-Compatible" content="IE=Edge">
              <!--<![endif]-->
              <!--[if (gte mso 9)|(IE)]>
              <xml>
                <o:OfficeDocumentSettings>
                  <o:AllowPNG/>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
              </xml>
              <![endif]-->
              <!--[if (gte mso 9)|(IE)]>
          <style type="text/css">
            body {width: 600px;margin: 0 auto;}
            table {border-collapse: collapse;}
            table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}
            img {-ms-interpolation-mode: bicubic;}
          </style>
        <![endif]-->
              <style type="text/css">
            body, p, div {
              font-family: arial,helvetica,sans-serif;
              font-size: 14px;
            }
            body {
              color: #000000;
            }
            body a {
              color: #1188E6;
              text-decoration: none;
            }
            p { margin: 0; padding: 0; }
            table.wrapper {
              width:100% !important;
              table-layout: fixed;
              -webkit-font-smoothing: antialiased;
              -webkit-text-size-adjust: 100%;
              -moz-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
            }
            img.max-width {
              max-width: 100% !important;
            }
            .column.of-2 {
              width: 50%;
            }
            .column.of-3 {
              width: 33.333%;
            }
            .column.of-4 {
              width: 25%;
            }
            ul ul ul ul  {
              list-style-type: disc !important;
            }
            ol ol {
              list-style-type: lower-roman !important;
            }
            ol ol ol {
              list-style-type: lower-latin !important;
            }
            ol ol ol ol {
              list-style-type: decimal !important;
            }
            @media screen and (max-width:480px) {
              .preheader .rightColumnContent,
              .footer .rightColumnContent {
                text-align: left !important;
              }
              .preheader .rightColumnContent div,
              .preheader .rightColumnContent span,
              .footer .rightColumnContent div,
              .footer .rightColumnContent span {
                text-align: left !important;
              }
              .preheader .rightColumnContent,
              .preheader .leftColumnContent {
                font-size: 80% !important;
                padding: 5px 0;
              }
              table.wrapper-mobile {
                width: 100% !important;
                table-layout: fixed;
              }
              img.max-width {
                height: auto !important;
                max-width: 100% !important;
              }
              a.bulletproof-button {
                display: block !important;
                width: auto !important;
                font-size: 80%;
                padding-left: 0 !important;
                padding-right: 0 !important;
              }
              .columns {
                width: 100% !important;
              }
              .column {
                display: block !important;
                width: 100% !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
              }
              .social-icon-column {
                display: inline-block !important;
              }
            }
          </style>
              <!--user entered Head Start--><!--End Head user entered-->
            </head>
            <body>
              <center class="wrapper" data-link-color="#1188E6" data-body-style="font-size:14px; font-family:arial,helvetica,sans-serif; color:#000000; background-color:#ffffff;">
                <div class="webkit">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#ffffff">
                    <tr>
                      <td valign="top" bgcolor="#ffffff" width="100%">
                        <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td width="100%">
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td>
                                    <!--[if mso]>
            <center>
            <table><tr><td width="600">
          <![endif]-->
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center">
                                              <tr>
                                                <td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#7dd6ff" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
            <tr>
              <td role="module-content">
                <p></p>
              </td>
            </tr>
          </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 0px 0px 0px;" bgcolor="#7dd6ff" data-distribution="1">
            <tbody>
              <tr role="module-content">
                <td height="100%" valign="top"><table width="568" style="width:568px; border-spacing:0; border-collapse:collapse; margin:0px 16px 0px 16px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
              <tbody>
                <tr>
                  <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="0d82e748-699d-4135-b799-9b1270108f0f" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:8px 8px 4px 8px; line-height:22px; text-align:inherit; background-color:#000000;" height="100%" valign="top" bgcolor="#000000" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 22px; color: #7dd6ff"><strong>Ecstasy</strong></span></div><div></div></div></td>
              </tr>
            </tbody>
          </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="2aae3c9b-2b12-4efb-b0f8-5d321309dda7.1" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:28px 0px 18px 0px; line-height:2px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 18px">Hello </span><span style="font-size: 18px"><strong>${userName}</strong></span></div><div></div></div></td>
              </tr>
            </tbody>
          </table><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c576953b-45e7-4d30-8db3-6ecbe8d65480">
            <tbody>
              <tr>
                <td style="font-size:6px; line-height:10px; padding:10px 40px 10px 40px;" valign="top" align="center"><img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:25% !important; width:25%; height:auto !important;" width="NaN" alt="Ecstasy Logo" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/343d77f11207ddc3/c3c3e641-048c-498d-aea8-d2ddeb9e619a/407x297.jpeg"></td>
              </tr>
            </tbody>
          </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a4a17632-f69c-4f88-8439-f2d92dfbb7c5" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:18px 0px 18px 0px; line-height:4px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 18px"><strong>Yardstick of Creative Illusion</strong></span></div><div></div></div></td>
              </tr>
            </tbody>
          </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="04b7f08e-3cb5-4f9b-9f19-50454ef1137b" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:28px 10px 18px 10px; line-height:14px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 16px">You got a new friend request</span></div><div></div></div></td>
              </tr>
            </tbody>
          </table><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="8847afd8-650e-4429-adb2-02c34c269dcb">
              <tbody>
                <tr>
                  <td align="center" bgcolor="" class="outer-td" style="padding:0px 0px 0px 0px;">
                    <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                      <tbody>
                        <tr>
                        <td align="center" bgcolor="#333333" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
                          <a href="${friendUrl}" style="background-color:#333333; border:0px solid #333333; border-color:#333333; border-radius:6px; border-width:0px; color:#7dd6ff; display:inline-block; font-size:16px; font-weight:700; letter-spacing:0px; line-height:normal; padding:10px 18px 10px 18px; text-align:center; text-decoration:none; border-style:solid;" target="_blank">${friendName}</a>
                        </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c2da6531-27b1-4bf3-bec3-0fd7262cc65e" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:18px 0px 18px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 16px"><strong>Let's change the way we get entertained</strong></span></div><div></div></div></td>
              </tr>
            </tbody>
          </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="6ee5e8bc-0e3c-4a35-a8c1-ce12dce883af" data-mc-module-version="2019-10-22">
            <tbody>
              <tr>
                <td style="padding:10px 10px 18px 30px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="font-size: 16px"><strong>Ecstasy Team</strong></span></div><div></div></div></td>
              </tr>
            </tbody>
          </table></td>
                </tr>
              </tbody>
            </table></td>
              </tr>
            </tbody>
          </table></td>
                                              </tr>
                                            </table>
                                            <!--[if mso]>
                                          </td>
                                        </tr>
                                      </table>
                                    </center>
                                    <![endif]-->
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>
              </center>
            </body>
          </html>`
    }
    sgMail.send(msg)
    .then(() => {
        console.log("email sent");
    })
    .catch( err => {
        console.log(err);
    })
}


module.exports = { sendFeedbackEmail, sendReportEmail, sendLoginSuccessEmail, sendFriendRequestEmail};
