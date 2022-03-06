const sendGridMail = require('@sendgrid/mail');
sendGridMail.setApiKey("");

function repeatUpdate(updatedLineItems) {
  let repeated = ``;
  updatedLineItems.forEach(element => {
    repeated = repeated + `<tr>
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
                                        <a href="" target="_blank"><img src="https://tlr.stripocdn.email/content/guids/CABINET_2fa2c297b157181178847753fc07eaf6/images/97841563182373007.png" alt="Natural Balance L.I.D., sale 30%" class="adapt-img" title="Natural Balance L.I.D., sale 30%" style="display: block;" width="270"></a>
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
                                    <td align="center" class="esd-block-spacer" height="40"></td>
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
                                    <td align="left" class="esd-block-button es-p15t es-p10b"><span class="es-button-border es-button-border-1563183272251"><a href="" class="es-button es-button-1563183272218" target="_blank">Details</a></span></td>
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
  });
  return repeated;

}



function getOrderConfirmationEmailHtml(cartData) {

  let repeated = repeatUpdate(cartData.lineItems);

  let html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  
  <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="telephone=no" name="format-detection">
      <title></title>
      <!--[if (mso 16)]>    <style type="text/css">    a {text-decoration: none;}    </style>    <![endif]-->
      <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]-->
      <!--[if gte mso 9]>
  <xml>
      <o:OfficeDocumentSettings>
      <o:AllowPNG></o:AllowPNG>
      <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
  </head>
  
  <body>
      <div class="es-wrapper-color">
          <!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
          <v:fill type="tile" color="transparent"></v:fill>
        </v:background>
      <![endif]-->
          <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="background-position: right top;">
              <tbody>
                  <tr>
                      <td class="esd-email-paddings" valign="top">
                          <table cellpadding="0" cellspacing="0" class="es-header esd-header-popover" align="center">
                              <tbody>
                                  <tr>
                                      <td class="esd-stripe" align="center" esd-custom-block-id="88632">
                                          <table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0" cellspacing="0" width="600">
                                              <tbody>
                                                  <tr>
                                                      <td class="es-p20t es-p20r es-p20l esd-structure" align="left" style="background-position: left top;">
                                                          <table cellpadding="0" cellspacing="0" width="100%">
                                                              <tbody>
                                                                  <tr>
                                                                      <td width="560" class="esd-container-frame" align="center" valign="top">
                                                                          <table cellpadding="0" cellspacing="0" width="100%">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td align="center" class="esd-block-text es-p20t" esd-links-color="#333333">
                                                                                          <h1><a target="_blank" style="font-size: 30px; color: #333333;" href="https://viewstripo.email/">COTtON</a></h1>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td align="center" class="esd-block-spacer es-p5t es-p10b es-p20r es-p20l" style="font-size:0">
                                                                                          <table border="0" width="35%" height="100%" cellpadding="0" cellspacing="0">
                                                                                              <tbody>
                                                                                                  <tr>
                                                                                                      <td style="border-bottom: 3px solid #d7b6a3; background: none; height: 1px; width: 100%; margin: 0px;"></td>
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
                                                      <td class="esd-structure es-p20r es-p20l" align="left" style="background-position: left top;">
                                                          <table cellpadding="0" cellspacing="0" width="100%">
                                                              <tbody>
                                                                  <tr>
                                                                      <td width="560" class="esd-container-frame" align="center" valign="top">
                                                                          <table cellpadding="0" cellspacing="0" width="100%">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="esd-block-menu" esd-tmp-menu-font-family="'lucida sans unicode','lucida grande',sans-serif" esd-tmp-menu-color="#333333" esd-tmp-menu-font-size="18px">
                                                                                          <table cellpadding="0" cellspacing="0" width="100%" class="es-menu">
                                                                                              <tbody>
                                                                                                  <tr class="links">
                                                                                                      <td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l"><a target="_blank" href="https://viewstripo.email/" style="font-family: 'lucida sans unicode', 'lucida grande', sans-serif; color: #333333; font-size: 18px;"> Favorites</a></td>
                                                                                                      <td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l"><a target="_blank" href="https://viewstripo.email/" style="font-family: 'lucida sans unicode', 'lucida grande', sans-serif; color: #333333; font-size: 18px;">Products</a></td>
                                                                                                      <td align="center" valign="top" width="33.33%" class="es-p10t es-p10b es-p5r es-p5l"><a target="_blank" href="https://viewstripo.email/" style="font-family: 'lucida sans unicode', 'lucida grande', sans-serif; color: #333333; font-size: 18px;"> Collections</a></td>
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
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                          <table cellpadding="0" cellspacing="0" class="es-content" align="center">
                              <tbody>
                                  <tr>
                                      <td class="esd-stripe" align="center" bgcolor="#ffffff" style="background-color: #ffffff;">
                                          <table bgcolor="#fbf5ed" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: #fbf5ed;">
                                              <tbody>
                                                  <tr>
                                                      <td class="esd-structure es-p20t es-p20r es-p20l" align="left" style="background-position: center center; background-color: transparent;" bgcolor="transparent">
                                                          <table cellpadding="0" cellspacing="0" width="100%">
                                                              <tbody>
                                                                  <tr>
                                                                      <td width="560" class="esd-container-frame" align="center" valign="top">
                                                                          <table cellpadding="0" cellspacing="0" width="100%">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td align="center" class="esd-block-text es-p10t es-p10r es-p10l">
                                                                                          <h1>Congratulations, you've selected a perfect look! </h1>
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
                                                      <td class="esd-structure es-p10t es-p10b es-p20r es-p20l" align="left">
                                                          <table cellpadding="0" cellspacing="0" width="100%">
                                                              <tbody>
                                                                  <tr>
                                                                      <td width="560" class="esd-container-frame" align="center" valign="top">
                                                                          <table cellpadding="0" cellspacing="0" width="100%">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td align="center" class="esd-block-text">
                                                                                          <p>Thank you for the order!</p>
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
                          <table cellpadding="0" cellspacing="0" class="es-content" align="center">
                              <tbody>
                                  <tr>
                                      <td class="esd-stripe" align="center" bgcolor="#ffffff" style="background-color: #ffffff;">
                                          <table class="es-content-body" width="600" cellspacing="0" cellpadding="0" bgcolor="#fbf5ed" align="center" style="background-color: #fbf5ed;">
                                              <tbody>
                                                  <tr>
                                                      <td class="esd-structure es-p20r es-p20l" esd-general-paddings-checked="false" align="left">
                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="esd-container-frame" width="560" valign="top" align="center">
                                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="esd-block-spacer es-p10b" align="center" style="font-size:0">
                                                                                          <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0">
                                                                                              <tbody>
                                                                                                  <tr>
                                                                                                      <td style="border-bottom: 1px solid #efefef; background: rgba(0, 0, 0, 0) none repeat scroll 0% 0%; height: 1px; width: 100%; margin: 0px;"></td>
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
                                                      <td class="esd-structure es-p20r es-p20l" align="left" style="background-color: #d7b6a3;" bgcolor="#d7b6a3">
                                                          <table cellpadding="0" cellspacing="0" width="100%">
                                                              <tbody>
                                                                  <tr>
                                                                      <td width="560" class="esd-container-frame" align="center" valign="top">
                                                                          <table cellpadding="0" cellspacing="0" width="100%">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td align="left" class="esd-block-text">
                                                                                          <p><strong>ITEMS ORDERED</strong></p>
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
                                                      <td class="esd-structure es-p20r es-p20l" esd-general-paddings-checked="false" align="left">
                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="esd-container-frame" width="560" valign="top" align="center">
                                                                          <table width="100%" cellspacing="0" cellpadding="0">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="esd-block-spacer es-p10b" align="center" style="font-size:0">
                                                                                          <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0">
                                                                                              <tbody>
                                                                                                  <tr>
                                                                                                      <td style="border-bottom: 1px solid #efefef; background: rgba(0, 0, 0, 0) none repeat scroll 0% 0%; height: 1px; width: 100%; margin: 0px;"></td>
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
                                                      <td class="esd-structure es-p10t es-p10b es-p20r es-p20l" align="left">
                                                          <!--[if mso]><table width="560" cellpadding="0" cellspacing="0"><tr><td width="470" valign="top"><![endif]-->
                                                          <table cellpadding="0" cellspacing="0" class="es-left" align="left">
                                                              <tbody>
                                                                  <tr>
                                                                      <td width="470" class="es-m-p20b esd-container-frame" align="left">
                                                                          <table cellpadding="0" cellspacing="0" width="100%">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td align="right" class="esd-block-text">
                                                                                          <p>Subtotal:</p>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td align="right" class="esd-block-text">
                                                                                          <p>Flat-rate Shipping:</p>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td align="right" class="esd-block-text">
                                                                                          <p>Discount:</p>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td align="right" class="esd-block-text">
                                                                                          <p><strong>Order Total:</strong></p>
                                                                                      </td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                      </td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                          <!--[if mso]></td><td width="20"></td><td width="70" valign="top"><![endif]-->
                                                          <table cellpadding="0" cellspacing="0" class="es-right" align="right">
                                                              <tbody>
                                                                  <tr>
                                                                      <td width="70" align="left" class="esd-container-frame">
                                                                          <table cellpadding="0" cellspacing="0" width="100%">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td align="right" class="esd-block-text">
                                                                                          <p>${cartData.subtotalPrice}</p>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td align="right" class="esd-block-text">
                                                                                          <p style="color: #38761d;"><strong>FREE</strong></p>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td align="right" class="esd-block-text">
                                                                                          <p style="color: #38761d;"><strong>0.00</strong></p>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td align="right" class="esd-block-text">
                                                                                          <p style="color: #b45f06;"><strong>${cartData.totalPrice}</strong></p>
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
                  
                          <table cellpadding="0" cellspacing="0" class="es-content" align="center">
                              <tbody>
                                  <tr>
                                      <td class="esd-stripe" align="center" esd-custom-block-id="88634">
                                          <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600">
                                              <tbody>
                                                  <tr>
                                                      <td class="esd-structure es-p20t es-p20b es-p20r es-p20l" align="left" style="background-position: left top; background-color: #d7b6a3;" bgcolor="#d7b6a3">
                                                          <!--[if mso]><table width="560" cellpadding="0" cellspacing="0"><tr><td width="270" valign="top"><![endif]-->
                                                          <table cellpadding="0" cellspacing="0" class="es-left" align="left">
                                                              <tbody>
                                                                  <tr>
                                                                      <td width="270" class="es-m-p20b esd-container-frame" align="left">
                                                                          <table cellpadding="0" cellspacing="0" width="100%">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td align="left" class="esd-block-social" style="font-size:0">
                                                                                          <table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social">
                                                                                              <tbody>
                                                                                                  <tr>
                                                                                                      <td align="center" valign="top" class="es-p10r">
                                                                                                          <a target="_blank" href><img title="Facebook" src="" alt="Fb" width="32"></a>
                                                                                                      </td>
                                                                                                      <td align="center" valign="top" class="es-p10r">
                                                                                                          <a target="_blank" href><img title="Twitter" src="" alt="Tw" width="32"></a>
                                                                                                      </td>
                                                                                                      <td align="center" valign="top" class="es-p10r">
                                                                                                          <a target="_blank" href><img title="Instagram" src="" alt="Inst" width="32"></a>
                                                                                                      </td>
                                                                                                      <td align="center" valign="top">
                                                                                                          <a target="_blank" href><img title="Youtube" src="" alt="Yt" width="32"></a>
                                                                                                      </td>
                                                                                                  </tr>
                                                                                              </tbody>
                                                                                          </table>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td align="left" class="esd-block-text es-p10t es-p10b es-p5r es-p5l">
                                                                                          <p style="font-size: 16px;"><strong>Сontact</strong></p>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td align="left" class="esd-block-text es-p5t es-p5r es-p5l">
                                                                                          <p style="font-size: 15px;">Washington,</p>
                                                                                          <p style="font-size: 15px;">District of Columbia, USA</p>
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
                                                                                      <td align="right" class="esd-block-text es-p5r es-p5l">
                                                                                          <p style="font-size: 16px;"><b>Phone:</b></p>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td align="right" class="esd-block-text es-p5r es-p5l">
                                                                                          <p style="font-size: 15px;"><a target="_blank" style="font-size: 15px;" href="tel:123456789">123456789</a></p>
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
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
  </body>
  
  </html>`
  return html;
}

function getMessage(cartData) {
  
  return {
    to:'xxstyagixx@gmail.com',
    from: 'xxstyagixx@gmail.com',
    subject: 'We have got your order, you will receive it soon',
    text: `Hey Shriom, we have received your order 123456. We will ship it soon`,
    html: getOrderConfirmationEmailHtml(cartData),
    // html: `<b>Hello from shriom side</b>`,
  };
}

async function sendOrderConfirmation(cartData) {
  try {
     let data =  await sendGridMail.send(getMessage(cartData));
     console.log("data" ,data);
     return  { message: `Order confirmation email sent successfully for orderNr:1234`};
  } catch (error) {
    const message = `Error sending order confirmation email or orderNr: 1234`;
    console.error(message);
    console.error(error);
    if (error.response) {
      console.error(error.response.body)
    }
    return {message};
  }
}



module.exports = {
  sendOrderConfirmation
}