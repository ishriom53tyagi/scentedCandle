const configSMTP = require('../config.json').smtp_config;
const configHandlebars = require('../config.json').handlebars;
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const { responseData } = require('../utils/responseHandler');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

exports.sendMail = function (emailObj) {
  // console.log('email obj is - > ', emailObj);

  var transporter = nodemailer.createTransport({
    host: configSMTP.host,
    secure: true, // use SSL
    auth: {
      user: configSMTP.auth.user, // neeta
      pass: configSMTP.auth.pass, //pwd
    },
  });

  var mailOptions = {
    from: emailObj.from,
    to: emailObj.to,
    subject: emailObj.subject,
  };

  if (emailObj && emailObj.template) {
    mailOptions['template'] = emailObj.template
  }
  if (emailObj && emailObj.html) {
    mailOptions['html'] = emailObj.html
  }

  console.log("mail options -->>>", mailOptions);

  if (emailObj.hbsFileName) {
    const handlebarOptions = {
      viewEngine: {
        extName: configHandlebars.options.extName,
        partialsDir: configHandlebars.options.viewEngine.partialsDir,
        layoutsDir: configHandlebars.options.viewEngine.layoutsDir,
        defaultLayout: emailObj.hbsFileName,
      },
      viewPath: configHandlebars.options.viewPath,
      extName: configHandlebars.options.extName,
    };

    transporter.use('compile', hbs(handlebarOptions));
    mailOptions.context = emailObj.context
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return error
      // return responseData(info, true, 400, 'Error in Sending Email', { error });
    } else {
      console.log('Email sent: ', info.response);
      // return responseData(info, true, 200, 'Email Sent', { info });
      return info.res
    }
  });
};
