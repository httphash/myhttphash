window.sodium = {
    onload: function (sodium) {

      let server = 'https://httphash.org/';
      let serveraccount = 'c348e59927d34bc5ac573e6da2973e8d2341c329d3d034d80d2c1e238919ca31';
      var mime = "text/plain";

      if($('.linkarea').attr('name')=="isqr"){

        var qrcodesk = new QRCode("qrcodesk", {text:' ',width:140,height:140,correctLevel:QRCode.CorrectLevel.H});
        var qrcodepk = new QRCode("qrcodepk", {text:' ',width:140,height:140,correctLevel:QRCode.CorrectLevel.H});

      }

      var links = '<div class="links">';
      links = links + '<a href="account.html" title="View Account details"><img src="img/login.png"></a><br>';
      links = links + '<a href="index.html" title="Create new Account"><img src="img/create.png"></a><br>';
      links = links + '<a href="transaction.html" title="Create/broadcast encrypted transaction"><img src="img/transaction.png"></a><br>';
      links = links + '<a href="decryption.html" title="Decrypt data"><img src="img/decrypt.png"></a><br>';
      links = links + '</div>';

      var footer = 'HTTPhash Wallet<br>';
      footer = footer + 'VERSION<br>FIREFOX - CHROME - OPERA<br><br>';
      footer = footer + 'based on <a href="https://github.com/jedisct1/libsodium.js/">libsodium.js</a>&nbsp;-&nbsp;<a href="https://davidshimjs.github.io/qrcodejs/">qrcode.js</a>&nbsp;-&nbsp;';
      footer = footer + '<a href="https://jquery.com/">jQuery</a>&nbsp;-&nbsp;<a href="https://getbootstrap.com/">Bootstrap</a><br><br><br>';
      footer = footer + '<a href=""><img src="img/facebook.png" class="img-fluid" alt="facebook"></a>&nbsp;&nbsp;&nbsp;&nbsp;';
      footer = footer + '<a href=""><img src="img/youtube.png" class="img-fluid" alt="YouTube"></a>&nbsp;&nbsp;&nbsp;&nbsp;';
      footer = footer + '<a href=""><img src="img/twitter.png" class="img-fluid" alt="Twitter"></a>&nbsp;&nbsp;&nbsp;&nbsp;';
      footer = footer + '<a href="https://github.com/httphash"><img src="img/github.png" class="img-fluid" alt="GitHub"></a>';
      footer = footer + '<br><br><br><br>';
      footer = footer + '<a href="https://www.httphash.com"><b>&copy; 2019 the HTTPhashProject</b></a><br><br>';
      footer = footer + '<a href="https://tronscan.org/#/address/TEULp5WpCc8sm6BjBxyv9YNc69HATYwvTK"><img src="img/tron.png" class="img-fluid">&nbsp;&nbsp;TEULp5WpCc8sm6BjBxyv9YNc69HATYwvTK</a><br><br>';
      footer = footer + '<a href="https://etherscan.io/address/0x31631607d974db708664bf2257a5f75bdffe1958"><img src="img/ethereum.png" class="img-fluid">&nbsp;&nbsp; 0x31631607d974db708664bf2257a5f75bdffe1958</a><br><br>';
      footer = footer + '<a href="https://www.blockchain.com/de/btc/address/13L7eCLsPo8CR9QkJS4iYSc4a3jp5RAMuW"><img src="img/bitcoin.png" class="img-fluid">&nbsp;&nbsp;13L7eCLsPo8CR9QkJS4iYSc4a3jp5RAMuW</a><br>';

      function generateNewAccount(){

        let newAccount = sodium.crypto_box_keypair();
        return [sodium.to_hex(newAccount.privateKey), sodium.to_hex(newAccount.publicKey)];

      }

      function generateNonce(){

        let nonce = sodium.to_hex(sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES));
        return nonce;

      }

      function generateAccountAddressFromSkey(skey){

        let account = '0x' + sodium.to_hex(sodium.crypto_scalarmult_base(sodium.from_hex(skey)));
        return account;

      }

      if($('#serverresponse').html()=="load"){

        rueckgabe = '<h3 class="text-center">Broadcast encrypted transaction</h3><br>';
        rueckgabe = rueckgabe +  '<form method="post" action="' + server + 'transaction" target="_blank">';
        rueckgabe = rueckgabe + '<textarea class="form-control" name="data" id="data" rows="10" placeholder="You need to be connected to the network to broadcast transaction."></textarea>';
        rueckgabe = rueckgabe + '<br><br><button type="submit" class="btn btn-success btn-lg encryptor" title="Broadcast transaction">&raquo; Broadcast transaction</button>';
        rueckgabe = rueckgabe + '</form><br><br>';
        $('#serverresponse').html(rueckgabe);

      }

      $('#inputFile').change(function(){

        $('.messenger').show();
        let skey = $('#privatekey').val();
        let account = generateAccountAddressFromSkey(skey);
        $('#serverresponse').html("processing...");

        if(account!=""){

          $('#progressBar').show('slow');
          var file = $('#inputFile')[0].files[0];
          var reader = new FileReader();

          reader.readAsArrayBuffer(file);

          reader.onloadstart = function(e) {

              $('#privatekey').val("");

	        };
          reader.onload = function(e){

              var data = new Uint8Array(reader.result);
              var nonce = generateNonce();
              var myprivatekey=sodium.from_hex(skey);
              var serverpublickey=sodium.from_hex(serveraccount);
              var ecnonce = sodium.from_hex(nonce);
              var stream = encrypt(data, myprivatekey, serverpublickey, ecnonce);
              $('.messenger').hide();
              stream = account + ":" + nonce + ":" + stream;
              rueckgabe = '<h3 class="text-center">Encryption Result</h3><br>';
              rueckgabe = rueckgabe + 'Account: ' + account + '<br>';
              rueckgabe = rueckgabe + 'Nonce: ' + nonce + '<br>';
              rueckgabe = rueckgabe +  '<form method="post" action="' + server + 'transaction" target="_blank">';
              rueckgabe = rueckgabe + '<label for="data">Transaction Data:</label>';
              rueckgabe = rueckgabe + '<textarea class="form-control" name="data" id="data" rows="10">' + stream + '</textarea>';
              rueckgabe = rueckgabe + '<br><br><button type="submit" class="btn btn-success btn-lg encryptor" title="Broadcast transaction">&raquo; Broadcast transaction</button>';
              rueckgabe = rueckgabe + '</form><br><br>';
              $('#serverresponse').html(rueckgabe);


          }
          reader.onprogress = function(data){

                progress = parseInt( ((data.loaded / data.total) * 100), 10);

          }

        }else{

          alert("Unvalid private key!");
          $('.messenger').hide();

        }

      });

      function download(filename, stream){

        var newBlob = new Blob([stream], {type: mime})

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(newBlob);
          return;
        }

        var data = window.URL.createObjectURL(newBlob);
        var link = document.createElement('a');
        link.href = data;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      }



      function decryptAndDownload(){

        $('.messenger').show();
        var data = sodium.from_hex($('#txdata').val());
        var myprivatekey=sodium.from_hex($('#txskey').val());
        var serverpublickey=sodium.from_hex(serveraccount);
        var nonce = sodium.from_hex($('#txnonce').val());
        var stream = decrypt(data, myprivatekey, serverpublickey, nonce);
        download('HTTPhashfile', stream);
        $('.messenger').hide();

      }

      function fetchDataFromServer(){

        $('.messenger').show();
        let account = $('#txid').val();
        var url = server + 'txdata/' + account;
        $.getJSON(url, function(data){

          if(data.data){

            mime = data.mime;
            $('#txnonce').val(data.nonce);
            $('#txdata').val(data.data);
            $('.messenger').hide();

          }

        }).fail(function() {

          alert("Connection to internet failed or unvalid txid!");
          $('.messenger').hide();

        });

      }

      function displayAccountInfos(){

        $('.messenger').show();
        let hash = $('#accounthash').val();
        var url = server + 'account/' + hash;
        $.getJSON(url, function(data){

          if(data.account.result.ACCOUNT){

            rueckgabe = "<b>ACCOUNT INFORMATION:</b><br>";
            rueckgabe = rueckgabe + "Account: " + data.account.result.ACCOUNT + "<br>";
            rueckgabe = rueckgabe + "Active: " + data.account.result.ACTIVE + "<br>";
            rueckgabe = rueckgabe + "Amound: " + data.account.result.AMOUND + "<br><br>";
            if(data.account.result.TX){
              rueckgabe = rueckgabe + "<b>TRANSACTIONS</b><br>";
              $.each(data.account.result.TX, function(i, item){

                tmpdata = $.parseJSON(item);
                rueckgabe = rueckgabe + '<div class="transaction">Date: ' + tmpdata.TIME + '<br>';
                rueckgabe = rueckgabe + 'TXID:&nbsp;<a title="View transaction" href="' + server + 'txinfo/' + tmpdata.TX_HASH + '" target="_blank">' + tmpdata.TX_HASH + "</a></div>";

              });
            }
            $('#serverresponse').html(rueckgabe);

          }else{

            $('#serverresponse').html("Account not found");

          }

        }).fail(function() {

          $('#serverresponse').html("Connection to internet failed!");

        });
        $('.messenger').hide();

      }

      function viewNewAccount(skey, pkey){

        let newAccount = generateNewAccount();
        $('#HTTPhashprivatekey').html(newAccount[0]);
        $('#HTTPhashpublickey').html('0x' + newAccount[1]);
        qrcodesk.makeCode($('#HTTPhashprivatekey').html());
        qrcodepk.makeCode($('#HTTPhashpublickey').html());

      }

      function encrypt(data, myskey, pkey, nonce){

        var rueckgabe = sodium.crypto_box_easy(data, nonce, pkey, myskey);
        return(sodium.to_hex(rueckgabe));

      }

      function decrypt(data, myskey, pkey, nonce){

        var rueckgabe = sodium.crypto_box_open_easy(data, nonce, pkey, myskey);
        return(rueckgabe);

      }

      function httpHash(data){

        var rueckgabe = sodium.crypto_generichash(64, sodium.from_string(data));
        return(sodium.to_hex(rueckgabe));

      }

      $('.decryptor').click(function() { decryptAndDownload(); });
      $('.accountinfo').click(function() { displayAccountInfos(); });
      $('.fetchdata').click(function() { fetchDataFromServer(); });
      $('.klicker').click(function() { viewNewAccount(); });
      $('.footer').html(footer);
      $('.linkarea').html(links);

    }

};
