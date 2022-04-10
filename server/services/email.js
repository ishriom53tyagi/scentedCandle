const sendGridMail = require('@sendgrid/mail')
sendGridMail.setApiKey(
  ''
)

function repeatUpdate(updatedLineItems) {
  let repeated = ``
  updatedLineItems.forEach((element) => {
    repeated =
      repeated +
      `<tr>
    <td class="esd-structure es-p20t es-p20b es-p20r es-p20l" align="left">
        <!--[if mso]><table width="560" cellpadding="0" cellspacing="0"><tr><td width="270" valign="top"><![endif]-->
        <table cellpadding="0" cellspacing="0" class="es-left" align="left">
            <tbody>
                <tr>
                    <td width="270" class="es-m-p20b esd-container-frame" align="left">
                        <table cellpadding="0" cellspacing="0" width="100%">
                            <tbody>
                                <tr>
                                    <td class="esd-block-image" align="center" style="font-size:0">
                                        <a href="" target="_blank"><img src="https://tlr.stripocdn.email/content/guids/CABINET_94315d81e0d4fd69c43a9dfb4e4c237f/images/29841502094430830.png" alt="Natural Balance L.I.D., sale 30%" class="adapt-img" title="Natural Balance L.I.D., sale 30%" style="display: inline-block; margin-top: 25px" width="60"></a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
        <!--[if mso]></td><td width="20"></td><td width="270" valign="top"><![endif]-->
        <table cellpadding="0" cellspacing="0" class="es-right" align="right">
            <tbody>
                <tr>
                    <td width="270" align="left" class="esd-container-frame">
                        <table cellpadding="0" cellspacing="0" width="100%">
                            <tbody>
                                <tr>
                                    <td align="left" class="esd-block-text">
                                        <p><strong>${element.name}</strong></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="left" class="esd-block-text">
                                        <p><b>QTY: </b>${element.quantity}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="left" class="esd-block-text">
                                        <p><b>PRICE: ${element.price}</b></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="left" class="esd-block-button es-p15t es-p10b"><span class="es-button-border es-button-border-1563183272251"><a href="" class="es-button es-button-1563183272218" target="_blank"></a></span></td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
    </td>
  </tr>`
  })
  return repeated
}

function getOrderConfirmationEmailHtml(cartData) {
  let repeated = repeatUpdate(cartData.lineItems)

  let html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  
  <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="telephone=no" name="format-detection">
      <!-- <link rel="stylesheet" type="text/css" href="style.css"> -->
      <title></title>
      <style>
          #outlook a {
      padding: 0;
  }
  
  .ExternalClass {
      width: 100%;
  }
  
  .ExternalClass,
  .ExternalClass p,
  .ExternalClass span,
  .ExternalClass font,
  .ExternalClass td,
  .ExternalClass div {
      line-height: 100%;
  }
  
  .es-button {
      mso-style-priority: 100 !important;
      text-decoration: none !important;
  }
  
  a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
  }
  
  .es-desk-hidden {
      display: none;
      float: left;
      overflow: hidden;
      width: 0;
      max-height: 0;
      line-height: 0;
      mso-hide: all;
  }
  
  [data-ogsb] .es-button {
      border-width: 0 !important;
      padding: 10px 20px 10px 20px !important;
  }
  
  [data-ogsb] .es-button.es-button-1647968655567 {
      padding: 10px 35px !important;
  }
  
  
  s {
      text-decoration: line-through;
  }
  
  html,
  body {
      width: 100%;
      font-family: Arial, sans-serif;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
  }
  
  table {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      border-collapse: collapse;
      border-spacing: 0px;
  }
  
  table td,
  html,
  body,
  .es-wrapper {
      padding: 0;
      Margin: 0;
  }
  
  .es-content,
  .es-header,
  .es-footer {
      table-layout: fixed !important;
      width: 100%;
  }
  
  img {
      display: block;
      border: 0;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
  }
  
  table tr {
      border-collapse: collapse;
  }
  
  p,
  hr {
      Margin: 0;
  }
  
  h1,
  h2,
  h3,
  h4,
  h5 {
      Margin: 0;
      line-height: 120%;
      mso-line-height-rule: exactly;
      font-family: Arial, sans-serif;
  }
  
  p,
  ul li,
  ol li,
  a {
      -webkit-text-size-adjust: none;
      -ms-text-size-adjust: none;
      mso-line-height-rule: exactly;
  }
  
  .es-left {
      float: left;
  }
  
  .es-right {
      float: right;
  }
  
  .es-p5 {
      padding: 5px;
  }
  
  .es-p5t {
      padding-top: 5px;
  }
  
  .es-p5b {
      padding-bottom: 5px;
  }
  
  .es-p5l {
      padding-left: 5px;
  }
  
  .es-p5r {
      padding-right: 5px;
  }
  
  .es-p10 {
      padding: 10px;
  }
  
  .es-p10t {
      padding-top: 10px;
  }
  
  .es-p10b {
      padding-bottom: 10px;
  }
  
  .es-p10l {
      padding-left: 10px;
  }
  
  .es-p10r {
      padding-right: 10px;
  }
  
  .es-p15 {
      padding: 15px;
  }
  
  .es-p15t {
      padding-top: 15px;
  }
  
  .es-p15b {
      padding-bottom: 15px;
  }
  
  .es-p15l {
      padding-left: 15px;
  }
  
  .es-p15r {
      padding-right: 15px;
  }
  
  .es-p20 {
      padding: 20px;
  }
  
  .es-p20t {
      padding-top: 20px;
  }
  
  .es-p20b {
      padding-bottom: 20px;
  }
  
  .es-p20l {
      padding-left: 20px;
  }
  
  .es-p20r {
      padding-right: 20px;
  }
  
  .es-p25 {
      padding: 25px;
  }
  
  .es-p25t {
      padding-top: 25px;
  }
  
  .es-p25b {
      padding-bottom: 25px;
  }
  
  .es-p25l {
      padding-left: 25px;
  }
  
  .es-p25r {
      padding-right: 25px;
  }
  
  .es-p30 {
      padding: 30px;
  }
  
  .es-p30t {
      padding-top: 30px;
  }
  
  .es-p30b {
      padding-bottom: 30px;
  }
  
  .es-p30l {
      padding-left: 30px;
  }
  
  .es-p30r {
      padding-right: 30px;
  }
  
  .es-p35 {
      padding: 35px;
  }
  
  .es-p35t {
      padding-top: 35px;
  }
  
  .es-p35b {
      padding-bottom: 35px;
  }
  
  .es-p35l {
      padding-left: 35px;
  }
  
  .es-p35r {
      padding-right: 35px;
  }
  
  .es-p40 {
      padding: 40px;
  }
  
  .es-p40t {
      padding-top: 40px;
  }
  
  .es-p40b {
      padding-bottom: 40px;
  }
  
  .es-p40l {
      padding-left: 40px;
  }
  
  .es-p40r {
      padding-right: 40px;
  }
  
  .es-menu td {
      border: 0;
  }
  
  .es-menu td a img {
      display: inline-block !important;
  }
  
  
  /*
  END CONFIG STYLES
  */
  
  a {
      text-decoration: none;
  }
  
  p,
  ul li,
  ol li {
      font-family: Arial, sans-serif;
      line-height: 150%;
  }
  
  ul li,
  ol li {
      Margin-bottom: 15px;
      margin-left: 0;
  }
  
  .es-menu td a {
      text-decoration: none;
      display: block;
      font-family: Arial, sans-serif;
  }
  
  .es-wrapper {
      width: 100%;
      height: 100%;
      background-image: ;
      background-repeat: repeat;
      background-position: center top;
  }
  
  .es-wrapper-color {
      background-color: #555555;
  }
  
  .es-header {
      background-color: transparent;
      background-image: ;
      background-repeat: repeat;
      background-position: center top;
  }
  
  .es-header-body {
      background-color: transparent;
  }
  
  .es-header-body p,
  .es-header-body ul li,
  .es-header-body ol li {
      color: #a0a7ac;
      font-size: 14px;
  }
  
  .es-header-body a {
      color: #a0a7ac;
      font-size: 14px;
  }
  
  .es-content-body {
      background-color: #f8f8f8;
  }
  
  .es-content-body p,
  .es-content-body ul li,
  .es-content-body ol li {
      color: #333333;
      font-size: 14px;
  }
  
  .es-content-body a {
      color: #3ca7f1;
      font-size: 14px;
  }
  
  .es-footer {
      background-color: transparent;
      background-image: ;
      background-repeat: repeat;
      background-position: center top;
  }
  
  .es-footer-body {
      background-color: #242424;
  }
  
  .es-footer-body p,
  .es-footer-body ul li,
  .es-footer-body ol li {
      color: #888888;
      font-size: 13px;
  }
  
  .es-footer-body a {
      color: #aaaaaa;
      font-size: 13px;
  }
  
  .es-infoblock,
  .es-infoblock p,
  .es-infoblock ul li,
  .es-infoblock ol li {
      line-height: 120%;
      font-size: 12px;
      color: #a0a7ac;
  }
  
  .es-infoblock a {
      font-size: 12px;
      color: #a0a7ac;
  }
  
  h1 {
      font-size: 30px;
      font-style: normal;
      font-weight: normal;
      color: #333333;
  }
  
  h2 {
      font-size: 24px;
      font-style: normal;
      font-weight: normal;
      color: #333333;
  }
  
  h3 {
      font-size: 20px;
      font-style: normal;
      font-weight: bold;
      color: #333333;
  }
  
  .es-header-body h1 a,
  .es-content-body h1 a,
  .es-footer-body h1 a {
      font-size: 30px;
  }
  
  .es-header-body h2 a,
  .es-content-body h2 a,
  .es-footer-body h2 a {
      font-size: 24px;
  }
  
  .es-header-body h3 a,
  .es-content-body h3 a,
  .es-footer-body h3 a {
      font-size: 20px;
  }
  
  a.es-button,
  button.es-button {
      border-style: solid;
      border-color: #242424;
      border-width: 10px 20px 10px 20px;
      display: inline-block;
      background: #242424;
      border-radius: 20px;
      font-size: 18px;
      font-family: 'lucida sans unicode', 'lucida grande', sans-serif;
      font-weight: normal;
      font-style: normal;
      line-height: 120%;
      color: #ffffff;
      text-decoration: none;
      width: auto;
      text-align: center;
  }
  
  .es-button-border {
      border-style: solid solid solid solid;
      border-color: #242424 #242424 #242424 #242424;
      background: #2cb543;
      border-width: 0px 0px 0px 0px;
      display: inline-block;
      border-radius: 20px;
      width: auto;
  }
  
  
  /*
  RESPONSIVE STYLES
  Please do not delete and edit CSS styles below.
   
  If you don't need responsive layout, please delete this section.
  */
  
  @media only screen and (max-width: 600px) {
      p,
      ul li,
      ol li,
      a {
          line-height: 150% !important;
      }
      h1,
      h2,
      h3,
      h1 a,
      h2 a,
      h3 a {
          line-height: 120% !important;
      }
      h1 {
          font-size: 30px !important;
          text-align: center;
      }
      h2 {
          font-size: 26px !important;
          text-align: center;
      }
      h3 {
          font-size: 20px !important;
          text-align: center;
      }
      .es-header-body h1 a,
      .es-content-body h1 a,
      .es-footer-body h1 a {
          font-size: 30px !important;
      }
      .es-header-body h2 a,
      .es-content-body h2 a,
      .es-footer-body h2 a {
          font-size: 26px !important;
      }
      .es-header-body h3 a,
      .es-content-body h3 a,
      .es-footer-body h3 a {
          font-size: 20px !important;
      }
      .es-header-body p,
      .es-header-body ul li,
      .es-header-body ol li,
      .es-header-body a {
          font-size: 16px !important;
      }
      .es-content-body p,
      .es-content-body ul li,
      .es-content-body ol li,
      .es-content-body a {
          font-size: 16px !important;
      }
      .es-footer-body p,
      .es-footer-body ul li,
      .es-footer-body ol li,
      .es-footer-body a {
          font-size: 16px !important;
      }
      .es-infoblock p,
      .es-infoblock ul li,
      .es-infoblock ol li,
      .es-infoblock a {
          font-size: 12px !important;
      }
      *[class="gmail-fix"] {
          display: none !important;
      }
      .es-m-txt-c,
      .es-m-txt-c h1,
      .es-m-txt-c h2,
      .es-m-txt-c h3 {
          text-align: center !important;
      }
      .es-m-txt-r,
      .es-m-txt-r h1,
      .es-m-txt-r h2,
      .es-m-txt-r h3 {
          text-align: right !important;
      }
      .es-m-txt-l,
      .es-m-txt-l h1,
      .es-m-txt-l h2,
      .es-m-txt-l h3 {
          text-align: left !important;
      }
      .es-m-txt-r img,
      .es-m-txt-c img,
      .es-m-txt-l img {
          display: inline !important;
      }
      .es-button-border {
          display: block !important;
      }
      a.es-button,
      button.es-button {
          font-size: 20px !important;
          display: block !important;
          border-width: 10px 20px 10px 20px !important;
      }
      .es-btn-fw {
          border-width: 10px 0px !important;
          text-align: center !important;
      }
      .es-adaptive table,
      .es-btn-fw,
      .es-btn-fw-brdr,
      .es-left,
      .es-right {
          width: 100% !important;
      }
      .es-content table,
      .es-header table,
      .es-footer table,
      .es-content,
      .es-footer,
      .es-header {
          width: 100% !important;
          max-width: 600px !important;
      }
      .es-adapt-td {
          display: block !important;
          width: 100% !important;
      }
      .adapt-img {
          width: 100% !important;
          height: auto !important;
      }
      .es-m-p0 {
          padding: 0px !important;
      }
      .es-m-p0r {
          padding-right: 0px !important;
      }
      .es-m-p0l {
          padding-left: 0px !important;
      }
      .es-m-p0t {
          padding-top: 0px !important;
      }
      .es-m-p0b {
          padding-bottom: 0 !important;
      }
      .es-m-p20b {
          padding-bottom: 20px !important;
      }
      .es-mobile-hidden,
      .es-hidden {
          display: none !important;
      }
      tr.es-desk-hidden,
      td.es-desk-hidden,
      table.es-desk-hidden {
          width: auto!important;
          overflow: visible!important;
          float: none!important;
          max-height: inherit!important;
          line-height: inherit!important;
      }
      tr.es-desk-hidden {
          display: table-row !important;
      }
      table.es-desk-hidden {
          display: table !important;
      }
      td.es-desk-menu-hidden {
          display: table-cell!important;
      }
      .es-menu td {
          width: 1% !important;
      }
      table.es-table-not-adapt,
      .esd-block-html table {
          width: auto !important;
      }
      table.es-social {
          display: inline-block !important;
      }
      table.es-social td {
          display: inline-block !important;
      }
  }
      </style>
  </head>
  
  <body style="color: black;">
      <div class="es-wrapper-color">
          <!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
          <v:fill type="tile" color="#555555"></v:fill>
        </v:background>
      <![endif]-->
          <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0">
              <tbody>
                  <tr>
                      <td class="esd-email-paddings" valign="top">
                          <table class="es-content" cellspacing="0" cellpadding="0" align="center">
                              <tbody>
                                  <tr>
                                      <td class="esd-stripe" align="center">
                                          <table class="es-content-body" width="600" cellspacing="0" cellpadding="0" align="center">
                                              <tbody>
                                                  <tr>
                                                      <td class="esd-structure es-p20t es-p20b es-p10r es-p10l" style="background-color: #191919;" esd-general-paddings-checked="false" bgcolor="#191919" align="left">
                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="esd-container-frame" width="580" valign="top" align="center">
                                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="esd-block-image" style="font-size:0" align="center">
                                                                                          <a target="_blank" href="https://viewstripo.email/"><img class="adapt-img" src="https://tlr.stripocdn.email/content/guids/CABINET_fb4f0a16f1a866906d2478dd087a5ccb/images/69401502088531077.png" alt width="105"></a>
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
                                                  <tr>
                                                      <td class="esd-structure es-p20t es-p20b es-p20r es-p20l" esd-general-paddings-checked="false" style="background-color: #ffcc99;" bgcolor="#ffcc99" align="left">
                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="esd-container-frame" width="560" valign="top" align="center">
                                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="esd-block-text es-p15t es-p15b" align="center">
                                                                                          <div class="esd-text">
                                                                                              <h2 style="color: #242424;"><span style="font-size:30px;"><strong>Your order is confirmed. </strong></span><br></h2>
                                                                                          </div>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="esd-block-text es-p10l" align="center">
                                                                                          <p style="color: #242424;">Hi Josh, we've received order No A12094653 and are working on it now.<br></p>
                                                                                          <p style="color: #242424;">We'll email you an update when we've shipped it.<br></p>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="esd-block-button es-p15t es-p15b es-p10r es-p10l" align="center"><span class="es-button-border" style="border-radius: 20px; background: #191919 none repeat scroll 0% 0%; border-style: solid; margin-bottom: 10px; border-color: #2cb543; border-width: 0px;"><a href="https://viewstripo.email/" class="es-button es-button-1647968655567" target="_blank" style="border-radius: 20px; font-family: lucida sans unicode,lucida grande,sans-serif; font-weight: normal; text-decoration: none; display: block; height: 25px; width: 280px; text-align: center; font-size: 18px; border-width: 10px 35px; background: #191919 none repeat scroll 0% 0%; border-color: #191919; color: #ffffff;">View your order details</a></span></td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                      </td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td class="esd-structure es-p15t es-p10b es-p10r es-p10l" style="background-color: #f8f8f8;" esd-general-paddings-checked="false" bgcolor="#f8f8f8" align="left">
                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="esd-container-frame" width="580" valign="top" align="center">
                                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="esd-block-text" align="center">
                                                                                          <h2 style="color: #191919;">Items ordered<br></h2>
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
                                                  ${repeated} 
                                                  <tr>
                                                      <td class="esd-structure es-p10t es-p10b es-p10r es-p10l" style="background-color: #f8f8f8;" esd-general-paddings-checked="false" bgcolor="#f8f8f8" align="left">
                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="esd-container-frame" width="580" valign="top" align="center">
                                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="esd-block-spacer es-p20t es-p20b es-p10r es-p10l" style="font-size:0" bgcolor="#f8f8f8" align="center">
                                                                                          <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0">
                                                                                              <tbody>
                                                                                                  <tr>
                                                                                                      <td style="border-bottom: 1px solid #191919; background: rgba(0, 0, 0, 0) none repeat scroll 0% 0%; height: 1px; width: 100%; margin: 0px;"></td>
                                                                                                  </tr>
                                                                                              </tbody>
                                                                                          </table>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="esd-block-text es-p15b" align="center">
                                                                                          <table class="cke_show_border" width="240" height="101" cellspacing="1" cellpadding="1" border="0">
                                                                                              <tbody>
                                                                                                  <tr>
                                                                                                      <td><strong>Subtotal:</strong></td>
                                                                                                      <td style="text-align: right;">${cartData.subtotalPrice}</td>
                                                                                                  </tr>
                                                                                                  <tr>
                                                                                                      <td><strong>Shipping:</strong></td>
                                                                                                      <td style="text-align: right;">FREE</td>
                                                                                                  </tr>
                                                                                                  <tr>
                                                                                                      <td><strong>Sales Tax:</strong></td>
                                                                                                      <td style="text-align: right;">$0.00</td>
                                                                                                  </tr>
                                                                                                  <tr>
                                                                                                      <td><span style="font-size: 18px; line-height: 200%;"><strong>Order Total:</strong></span></td>
                                                                                                      <td style="text-align: right;"><span style="font-size: 18px; line-height: 200%;"><strong>${cartData.totalPrice}</strong></span></td>
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
                                                  <tr>
                                                      <td class="esd-structure es-p15t es-p10b es-p10r es-p10l" style="background-color: #eeeeee;" esd-general-paddings-checked="false" bgcolor="#eeeeee" align="left">
                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="esd-container-frame" width="580" valign="top" align="center">
                                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="esd-block-text" align="center">
                                                                                          <h2 style="color: #191919;">Order & shipping info</h2>
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
                                                  <tr>
                                                      <td class="esd-structure es-p10t es-p30b es-p20r es-p20l" esd-general-paddings-checked="false" style="background-color: #eeeeee;" bgcolor="#eeeeee" align="left">
                                                          <!--[if mso]><table width="560" cellpadding="0" cellspacing="0"><tr><td width="270" valign="top"><![endif]-->
                                                          <table class="es-left" cellspacing="0" cellpadding="0" align="left">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="es-m-p20b esd-container-frame" width="270" align="left">
                                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="esd-block-text es-p10t es-p10b" align="left">
                                                                                          <h3 style="color: #242424;">Order details</h3>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="esd-block-text" align="left">
                                                                                          <p><strong>Order No:</strong> A12094653</p>
                                                                                          <p><strong>Member No:</strong> 213983</p>
                                                                                          <p><strong>Shipping Method:</strong> Standard</p>
                                                                                          <p><strong>Order date:</strong> 04/07/2016</p>
                                                                                      </td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                      </td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                          <!--[if mso]></td><td width="20"></td><td width="270" valign="top"><![endif]-->
                                                          <table class="es-right" cellspacing="0" cellpadding="0" align="right">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="esd-container-frame" width="270" align="left">
                                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="esd-block-text es-p10t es-p10b" align="left">
                                                                                          <h3 style="color: #242424;">Shipping Address</h3>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="esd-block-text" align="left">
                                                                                          <p>Josh Makwey<strong></strong></p>
                                                                                          <p>96 Wiilmedrie St</p>
                                                                                          <p>San jose, CA 95987<br></p>
                                                                                          <p>Estimated delivery: 04/10/16 - 04/14/16<br></p>
                                                                                      </td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                      </td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                          <!--[if mso]></td></tr></table><![endif]-->
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td class="esd-structure es-p25t es-p30b es-p20r es-p20l" esd-general-paddings-checked="false" style="background-color: #f8f8f8;" bgcolor="#f8f8f8" align="left">
                                                          <!--[if mso]><table width="560" cellpadding="0" cellspacing="0"><tr><td width="270" valign="top"><![endif]-->
                                                          <table class="es-left" cellspacing="0" cellpadding="0" align="left">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="es-m-p20b esd-container-frame" width="270" align="left">
                                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="esd-block-text es-p10b" align="center">
                                                                                          <h3 style="color: #242424;">We're here to help</h3>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="esd-block-text" align="center">
                                                                                          <p style="line-height: 150%; color: #242424;">Call <a target="_blank" style="line-height: 150%; " href="tel:123456789">123456789</a> or <a target="_blank" href="https://viewstripo.email/">visit us online</a></p>
                                                                                          <p style="line-height: 150%; color: #242424;">for expert assistance.</p>
                                                                                      </td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                      </td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                          <!--[if mso]></td><td width="20"></td><td width="270" valign="top"><![endif]-->
                                                          <table class="es-right" cellspacing="0" cellpadding="0" align="right">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="esd-container-frame" width="270" align="left">
                                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="esd-block-text es-p10b" align="center">
                                                                                          <h3 style="color: #242424;">Our guarantee</h3>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="esd-block-text" align="center">
                                                                                          <p style="line-height: 150%; color: #242424;">Your satisfaction is 100% guaranteed.</p>
                                                                                          <p style="line-height: 150%; color: #242424;">See our <a target="_blank" href="https://viewstripo.email/">Returns and Exchanges policy.</a></p>
                                                                                      </td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                      </td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                          <!--[if mso]></td></tr></table><![endif]-->
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                          <table class="es-footer" cellspacing="0" cellpadding="0" align="center">
                              <tbody>
                                  <tr>
                                      <td class="esd-stripe" esd-custom-block-id="88703" align="center">
                                          <table class="es-footer-body" width="600" cellspacing="0" cellpadding="0" align="center">
                                              <tbody>
                                                  <tr>
                                                      <td class="esd-structure es-p20" esd-general-paddings-checked="false" align="left">
                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="esd-container-frame" width="560" valign="top" align="center">
                                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="esd-block-social es-p10t es-p20b" style="font-size:0" align="center">
                                                                                          <table class="es-table-not-adapt es-social" cellspacing="0" cellpadding="0">
                                                                                              <tbody>
                                                                                                  <tr>
                                                                                                      <td class="es-p15r" valign="top" align="center">
                                                                                                          <a href><img title="Twitter" src="https://stripo.email/cabinet/assets/editor/assets/img/social-icons/circle-gray/twitter-circle-gray.png" alt="Tw" width="32" height="32"></a>
                                                                                                      </td>
                                                                                                      <td class="es-p15r" valign="top" align="center">
                                                                                                          <a href><img title="Facebook" src="https://stripo.email/cabinet/assets/editor/assets/img/social-icons/circle-gray/facebook-circle-gray.png" alt="Fb" width="32" height="32"></a>
                                                                                                      </td>
                                                                                                      <td class="es-p15r" valign="top" align="center">
                                                                                                          <a href><img title="Youtube" src="https://stripo.email/cabinet/assets/editor/assets/img/social-icons/circle-gray/youtube-circle-gray.png" alt="Yt" width="32" height="32"></a>
                                                                                                      </td>
                                                                                                      <td valign="top" align="center">
                                                                                                          <a href><img title="Linkedin" src="https://stripo.email/cabinet/assets/editor/assets/img/social-icons/circle-gray/linkedin-circle-gray.png" alt="In" width="32" height="32"></a>
                                                                                                      </td>
                                                                                                  </tr>
                                                                                              </tbody>
                                                                                          </table>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="esd-block-text" align="center">
                                                                                          <p><strong><a target="_blank" style="line-height: 150%;" href="https://viewstripo.email">Browse all products</a>&nbsp;</strong>•<strong><a target="_blank" style="line-height: 150%;" href="https://viewstripo.email">Locate store</a></strong></p>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="esd-block-text es-p20t es-p20b" align="center">
                                                                                          <p style="line-height: 120%;">Electro, Inc.</p>
                                                                                          <p style="line-height: 120%;">62 N. Gilbert, CA 99999</p>
                                                                                          <p style="line-height: 120%;"><a target="_blank" style="line-height: 120%;" href="tel:123456789">123456789</a></p>
                                                                                          <p style="line-height: 120%;"><a target="_blank" href="mailto:your@mail.com" style="line-height: 120%;">your@mail.com</a></p>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="esd-block-text" align="center">
                                                                                          <p><strong><a target="_blank" style="line-height: 150%;" class="unsubscribe" href>Unsubscribe</a> • <a target="_blank" style="line-height: 150%;" href="https://viewstripo.email">Update Preferences</a> • <a target="_blank" style="line-height: 150%;" href="https://viewstripo.email">Customer Support</a></strong></p>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="esd-block-text es-p10t es-p10b" align="center">
                                                                                          <p><em><span style="font-size: 11px; line-height: 150%;">You are receiving this email because you have visited our site or asked us about regular newsletter</span></em></p>
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
                              </tbody>
                          </table>
                          
                              
                                                                      </table>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
  </body>
  
  </html>`
  return html
}

function getMessage(cartData) {
  return {
    to: 'pshubham1886@gmail.com',
    from: 'xxstyagixx@gmail.com',
    subject: 'We have got your order, you will receive it soon',
    text: `Hey Shriom, we have received your order 123456. We will ship it soon`,
    html: getOrderConfirmationEmailHtml(cartData),
    // html: `<b>Hello from shriom side</b>`,
  }
}

async function sendOrderConfirmation(cartData) {
  try {
    let data = await sendGridMail.send(getMessage(cartData))
    console.log('data', data)
    return {
      message: `Order confirmation email sent successfully for orderNr:1234`,
    }
  } catch (error) {
    const message = `Error sending order confirmation email or orderNr: 1234`
    console.error(message)
    console.error(error)
    if (error.response) {
      console.error(error.response.body)
    }
    return { message }
  }
}

module.exports = {
  sendOrderConfirmation,
}
