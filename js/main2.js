$(document).ready(function(){
	

    /*
     * Bespoke Landing Page
     * Author: Techman
     * Skype: techman.dev
	 * Website: http://techman.co
	 */

	 outdatedBrowser({
	 	bgColor: '#f25648',
	 	color: '#ffffff',
	 	lowerThan: 'transform',
	 	languagePath: 'outdatedbrowser/lang/en.html'
	 });

	 

	 $('.generator-form .cc-username-wrap').animateCSS("bounceInUp", {delay: 100});
	 $('.generator-form .cc-device-wrap').animateCSS("bounceInUp", {delay: 100});
	 $('.generator-form .cc-gems-wrap').animateCSS("bounceInUp", {delay: 300});
	 $('.generator-form .cc-gold-wrap').animateCSS("bounceInUp", {delay: 300});
	 $('.generator-form .cc-elixir-wrap').animateCSS("bounceInUp", {delay: 300});
	 $('.generator-form .cc-btn-wrap').animateCSS("bounceInUp", {delay: 500});

	// $('.step-one').flexVerticalCenter({
	// 	parentSelector: '.generator-form'
	// });

	if(window.innerWidth >= 700) {
		$('.updates-box .right-side').flexVerticalCenter({
			parentSelector: '.updates-box'
		});
	}

	var message_icons_name = [
	['gems', '<img src="img/gems-icon.png" style="max-height: 15px;"/>'],
	['gold', '<img src="img/gold-icon.png" style="max-height: 15px;"/>']
	]

	changeUpdateMessage();

	timer = new Date().valueOf() + (5 * 60 * 1000);


	$(".timer").countdown(timer.toString(), function(event) {
		$(this).text(event.strftime('%M:%S'));
	});

	var gems_stat = getRandomInt(25432, 123993);
	var gold_stat = getRandomInt(26757, 169726);

	$('.coc-gem-stat').text(gems_stat);
	$('.coc-gold-stat').text(gold_stat);

	setInterval(function(){

		gems_stat = gems_stat + getRandomInt(17483, 123993);
		gold_stat = gold_stat + getRandomInt(26757, 169726);

		$('.coc-gem-stat').fadeOut().text(gems_stat).fadeIn();
		$('.coc-gold-stat').fadeOut().text(gold_stat).fadeIn();

		$('.updates-box .coc-update-msg').animateCSS("fadeOutUp", {
			delay: 0,
			callback: function(){
				$('.updates-box .coc-update-msg').css('visibility', 'hidden');
				changeUpdateMessage();
				$('.updates-box .coc-update-msg').animateCSS("fadeInUp");
			}
		});
	}, getRandomInt(2000, 7000));

	function changeUpdateMessage() {
		// var msg = faker.internet.userName() + ' has ' + messages[getRandomInt(0, 10)];
		var random_number = getRandomInt(0, 1);
		var msg = faker.internet.userName() + ' has generated ' + message_icons_name[random_number][1] + ' ' + getRandomInt(1000, 999999) + ' ' + message_icons_name[random_number][0];
		$('.updates-box .coc-update-msg .message').html(msg);
	}

	$('.generate-btn').on('click', function(){
		if($('#ccUsername').val() != '') {
			if($('#ccGems select').val() != ''&& $('#ccGold select').val() != '') {
				confirmDialogOpen($('#ccGems select').val(), $('#ccGold select').val(), function(){
					$('.generator-form .cc-username-wrap').animateCSS("bounceOutUp", {delay: 100, callback: function(){ $(this).hide(); }});
					$('.generator-form .cc-device-wrap').animateCSS("bounceOutUp", {delay: 100, callback: function(){ $(this).hide(); }});
					$('.generator-form .cc-gems-wrap').animateCSS("bounceOutUp", {delay: 300, callback: function(){ $(this).hide(); }});
					$('.generator-form .cc-gold-wrap').animateCSS("bounceOutUp", {delay: 300, callback: function(){ $(this).hide(); }});
					$('.generator-form .cc-elixir-wrap').animateCSS("bounceOutUp", {delay: 300, callback: function(){ $(this).hide(); }});
					$('.generator-form .cc-btn-wrap').animateCSS("bounceOutUp", {
						delay: 500,
						callback: function(){
							$(this).hide();
							var vh_height = $(window).width();
							var new_height = 430;
							if(vh_height <= 800) {
								new_height = 550;
							}
							$('.generator-form').animate({
								height: new_height
							}, "fast", function(){
								$('.generator-form .step-two').show();
                                // $('.generator-form .step-two').flexVerticalCenter({
                                //     parentSelector: '.generator-form'
                                // });
                                $('.generator-form .step-two .loader-wrap').animateCSS("bounceInUp", {delay: 100});
                                $('.generator-form .step-two .loader-msg').animateCSS("bounceInUp", {delay: 100});
                                $('.generator-form .step-two .generator-console').animateCSS("bounceInUp", {
                                	delay: 300,
                                	callback: function(){
                                		startConsoleAnimation(function(){
                                            // content locker code// Content locker code here
                                            $('.modal-header').addClass('header-custom');
                                            $('#humanVerificationModal').modal({
                                            	backdrop: 'static',
                                            	keyboard: false
                                            });
                                            $('.waitng-survey-offers').append('<img src=""/>');
                                       });
                                	}
                                });
                            });
						}});
				});
			} else {
				sweetAlert("Error", "Veuillez entrez une valeur pour les ressources gold et gemmes SVP.", "error");
			}
		} else {
			sweetAlert("Error", "Entrez votre pseudo Clash Royale SVP.", "error");
		}
	});

	$("#ccGems input, #ccGold input").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
             // Allow: Ctrl+A, Command+A
             (e.keyCode == 65 && ( e.ctrlKey === true || e.metaKey === true ) ) ||
             // Allow: home, end, left, right, down, up
             (e.keyCode >= 35 && e.keyCode <= 40)) {
                 // let it happen, don't do anything
             return;
         }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        	e.preventDefault();
        }
    });

	function confirmDialogOpen(gems, gold, callback){
		bootbox.dialog({
			message: "<p>Etes vous sûr d'ajouter ce nombre de ressources sur votre compte?</p><p><img src='img/gems-icon.png' height='20px'/> " + gems + ".</p><p><img src='img/gold-icon.png' height='20px'/> " + gold + ".</p>",
			title: "Je valide",
			buttons: {
				main: {
					label: "Annuler",
					className: "btn-default",
					callback: function() {
						bootbox.hideAll();
					}
				},
				success: {
					label: "Oui",
					className: "btn-success",
					callback: function() {
						bootbox.hideAll();
						callback();
					}
				}
			}
		});
	}

	$('.generator-console').on('DOMSubtreeModified', function(){
		$(".generator-console").scrollTop($(".generator-console")[0].scrollHeight);
	});

	function startConsoleAnimation(callback){
		/* CONSOLE ANIMATION */
		$('.generator-console').dynatexer({
			loop: 1,
			content: [
			{
				animation: 'additive',
				delay: 0,
				placeholder: '<span class="console_text white">',
				render_strategy: 'text-one-shot',
				items: "[root@28.3.4.53.2]$ "
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text white">',
				render_strategy: 'text-by-char',
				items: "open_ssl_connection clash_royale -s 28.3.4.53.2 -deobfuscate -encrypt_aes_256"
			},
			{
				delay: 50
			},
			{
				animation: 'additive',
				delay: 2,
				placeholder: '<span class="console_text blue">',
				render_strategy: 'text-one-shot',
				items: "\nOpening port 423245.\n"
			},
			{
				animation: 'replace',
				delay: 3,
				placeholder: '<span class="console_text yellow">',
				render_strategy: 'iterator',
				items: $().dynatexer.helper.counter({
					start: 1,
					end: 100,
					step: 1,
					mask: '%d%'
				})
			},
			{
				animation: 'additive',
				delay: 20,
				placeholder: '<span class="console_text green">',
				render_strategy: 'text-one-shot',
				items: "\nPort 423245 opened successfully."
			},
			{
				animation: 'additive',
				delay: 20,
				placeholder: '<span class="console_text blue">',
				render_strategy: 'text-one-shot',
				items: "\nEncrypting connection: open_ssl_aes256(28.3.4.53.2);\n"
			},
			{
				animation: 'replace',
				delay: 5,
				render_strategy: 'iterator',
				placeholder: '<span class="console_text yellow">',
				items: $().dynatexer.helper.counter({
					start: 1,
					end: 100,
					step: 1,
					mask: '%d%'
				})
			},
			{
				animation: 'additive',
				delay: 20,
				placeholder: '<span class="console_text green">',
				render_strategy: 'text-one-shot',
				items: "\nConnection encrypted successfully."
			},
			{
				animation: 'additive',
				delay: 0,
				placeholder: '<span class="console_text white">',
				render_strategy: 'text-one-shot',
				items: "\n[root@28.3.4.53.2]$ "
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text white">',
				render_strategy: 'text-by-char',
				items: "import server files /usr/ect/kernel/server/config.json"
			},
			{
				delay: 50
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text blue">',
				render_strategy: 'text-one-shot',
				items: "\nImporting config.json\n"
			},
			{
				animation: 'replace',
				delay: 5,
				placeholder: '<span class="console_text yellow">',
				render_strategy: 'iterator',
				items: $().dynatexer.helper.counter({
					start: 1,
					end: 100,
					step: 1,
					mask: '%d%'
				})
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text green">',
				render_strategy: 'text-one-shot',
				items: "\n‘config.json’ file has been imported successfully."
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text blue">',
				render_strategy: 'text-one-shot',
				items: "\nDe-obfuscating server config files.\n"
			},
			{
				animation: 'replace',
				delay: 3,
				placeholder: '<span class="console_text yellow">',
				render_strategy: 'iterator',
				items: $().dynatexer.helper.counter({
					start: 1,
					end: 100,
					step: 1,
					mask: '%d%'
				})
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text green">',
				render_strategy: 'text-one-shot',
				items: "\nFiles de-obfuscated successfully."
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text blue">',
				render_strategy: 'text-one-shot',
				items: "\nDecrypting server configuration files.\n"
			},
			{
				animation: 'replace',
				delay: 5,
				placeholder: '<span class="console_text yellow">',
				render_strategy: 'iterator',
				items: $().dynatexer.helper.counter({
					start: 1,
					end: 100,
					step: 1,
					mask: '%d%'
				})
			},
			{
				animation: 'additive',
				delay: 30,
				placeholder: '<span class="console_text green">',
				render_strategy: 'text-one-shot',
				items: "\nConfigurations files are now imported and readable."
			},
			{
				animation: 'additive',
				delay: 0,
				placeholder: '<span class="console_text white">',
				render_strategy: 'text-one-shot',
				items: "\n[root@28.3.4.53.2]$ "
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text white">',
				render_strategy: 'text-by-char',
				items: "edit_config -gems " + $('#ccGems select').val() + " -gold " + $('#ccGold select').val()
			},
			{
				delay: 20
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text blue">',
				render_strategy: 'text-one-shot',
				items: "\nOpen server configurations files in edit mode.\n"
			},
			{
				animation: 'replace',
				delay: 3,
				placeholder: '<span class="console_text yellow">',
				render_strategy: 'iterator',
				items: $().dynatexer.helper.counter({
					start: 1,
					end: 100,
					step: 1,
					mask: '%d%'
				})
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text green">',
				render_strategy: 'text-one-shot',
				items: "\nConfigurations files is now open in edit mode."
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text blue">',
				render_strategy: 'text-one-shot',
				items: "\nChange GEMS to " + $('#ccGems select').val() +".\n"
			},
			{
				animation: 'replace',
				delay: 4,
				placeholder: '<span class="console_text yellow">',
				render_strategy: 'iterator',
				items: $().dynatexer.helper.counter({
					start: 1,
					end: 100,
					step: 1,
					mask: '%d%'
				})
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text green">',
				render_strategy: 'text-one-shot',
				items: "\nGems changed successfully."
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text blue">',
				render_strategy: 'text-one-shot',
				items: "\nChange GOLD to " + $('#ccGold select').val() +".\n"
			},
			{
				animation: 'replace',
				delay: 3,
				placeholder: '<span class="console_text yellow">',
				render_strategy: 'iterator',
				items: $().dynatexer.helper.counter({
					start: 1,
					end: 100,
					step: 1,
					mask: '%d%'
				})
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text green">',
				render_strategy: 'text-one-shot',
				items: "\nGold changed successfully."
			},
			{
				animation: 'additive',
				delay: 3,
				placeholder: '<span class="console_text blue">',
				render_strategy: 'text-one-shot',
				items: "\nClose configuration file.\n"
			},
			{
				animation: 'replace',
				delay: 3,
				placeholder: '<span class="console_text yellow">',
				render_strategy: 'iterator',
				items: $().dynatexer.helper.counter({
					start: 1,
					end: 100,
					step: 1,
					mask: '%d%'
				})
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text green">',
				render_strategy: 'text-one-shot',
				items: "\nConfiguration file is now closed."
			},
			{
				animation: 'additive',
				delay: 0,
				placeholder: '<span class="console_text white">',
				render_strategy: 'text-one-shot',
				items: "\n[root@28.3.4.53.2]$ "
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text white">',
				render_strategy: 'text-by-char',
				items: "save_config -S -v /usr/ect/kernel/sever/config.json"
			},
			{
				delay: 20
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text blue">',
				render_strategy: 'text-one-shot',
				items: "\nExporting temporary configuration file to main server.\n"
			},
			{
				animation: 'replace',
				delay: 3,
				placeholder: '<span class="console_text yellow">',
				render_strategy: 'iterator',
				items: $().dynatexer.helper.counter({
					start: 1,
					end: 100,
					step: 1,
					mask: '%d%'
				})
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text red">',
				render_strategy: 'text-one-shot',
				items: "\nFailed to export configuration file, bot detected."
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text blue">',
				render_strategy: 'text-one-shot',
				items: "\nTrying again to export configuration files.\n"
			},
			{
				animation: 'replace',
				delay: 4,
				placeholder: '<span class="console_text yellow">',
				render_strategy: 'iterator',
				items: $().dynatexer.helper.counter({
					start: 1,
					end: 100,
					step: 1,
					mask: '%d%'
				})
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text red">',
				render_strategy: 'text-one-shot',
				items: "\nFailed to export configuration file, bot detected."
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text blue">',
				render_strategy: 'text-one-shot',
				items: "\nTrying one last time to export configuration files.\n"
			},
			{
				animation: 'replace',
				delay: 5,
				placeholder: '<span class="console_text yellow">',
				render_strategy: 'iterator',
				items: $().dynatexer.helper.counter({
					start: 1,
					end: 100,
					step: 1,
					mask: '%d%'
				})
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text red">',
				render_strategy: 'text-one-shot',
				items: "\nExport failed, anti-human verification system detected potential bot."
			},
			{
				animation: 'additive',
				delay: 5,
				placeholder: '<span class="console_text yellow">',
				render_strategy: 'text-one-shot',
				items: "\nPlease complete the human verification popup."
			},
			],
			cursor: {
				animation: 'replace',
				loop: 'infinite',
				delay: 100,
				placeholder: '<span class="console_cursor">',
				render_strategy: 'array-items',
				items: ['|', '']
			}
		});
$('.generator-console').dynatexer('play', function() {
	console.log('complete');
	callback();
});
/* END CONSOLE ANIMATION */
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

	/*
	 * Live Chat
	 */

	 var livechat_name = '';

	 var livechat_text_area = $('.livechatListArea');
	 var livechat_text_list = $('.chatList');
	 var livechat_text_area_height = livechat_text_area.height();

	 var name_colors = ['#d4a112', '#987c2f', '#b02643', '#d72248', '#9d22d7', '#a65fc7', '#2771bc', '#1a82ed', '#28ba4a', '#136b28', '#9bc716'];

	 var chat_names = ['Richard23', 'Philip', 'Rob001', 'Hill213', 'Prim', 'Grequod', 'Moseeld30', 'Allichere', 'Munplad60', 'Therainged', 'Perseent', 'Wasice59', 'Arrent', 'Quot1991', 'Yourlenis', 'arthasxx', 'Clasher895', 'pekka17', 'machupichu', 'cidem', 'motidas', 'abana', 'zefdi45'];

	 var chat_messages = ["100 000 gemmes 100 000 gold que demande le peuple ahaha","Vidéo partagé avec mes potes et mes abonnés , jen ai un max tu vas avoir pleins de gens sur to ngénérateur","tu utilise quoi pour faire tes vidéos","merci pour ces 100 000 gemmes je vais pouvoir éclater tous ces gars qui ont des cartes de fous","Gros gg a toi tu ma motiver a continuer le jeu","Cool ca","big up bro je partage avec tous mes potes","faites le moi svp mon téléphone est cassé :(","bravo pour ce générateur jai était cool car jaime pas trop tricher que 1000 gemmes mais ca va maider","dans le cul lulu jai eu mes gemmes ahahah","ca marcheeeeeeeeeeeeeeeeeeeeeeee putin tro bon","Salut bien joué la vidéo , jai utilisé le générateur hier bon les gemmes mettent du temps a arrivé mais elles sont arrivés , premier coffre le chevalier ahaha merci mec et continue comme ca?","je vais te payer un coup kan tu veux pour ces gemmes","Merci","merci mec tu viens de me rendre heureux 50 000 gemmes gratos comme ca ;)","pour une fois quun générateur marche cest pas trop tot","Allez la paye tes gemmes mes potes vont etre deg","Merci cam arche","Wow tu mérite le numero de ma soeur ahaha merci","Tu peux me le faire stp mec mon pseudo cest dadou78","Wow merci mec trop bon ca marche jai attendu 3 heures mais ca vallais le coup","le clan payamo12 recrute venez tous les gars on chercher des potes","Merci ca marche","Aahah tu viens de faire ma journée et bammmmmmmm 50 000 gemmes dans les poches","venez me défier les noob","tu compte le faire pour un autre jeu"];

	 setInterval(function(){
	 	add_livechat_msg(chat_names[getRandomInt(1, chat_names.length - 1)], name_colors[getRandomInt(1, name_colors.length - 1)], chat_messages[getRandomInt(1, chat_messages.length - 1)]);
	 }, getRandomInt(12000, 40000));


	 $('.livechatSubmtBtn').click(function(){
	 	if(livechat_name == '') {
	 		$('.livechatNameBox').show();
	 	} else {
	 		add_livechat_msg(livechat_name, '#136b28', $('.livechatMsg').val());
	 		$('.livechatMsg').val('');
	 	}
	 });

	 $('.livechatNicknameBtn').click(function(){
	 	var name_input = $('#livechat_name');
	 	if(name_input.val() != '') {
	 		livechat_name = name_input.val();
	 		$(this).parents('.livechatNameBox').hide();
	 	} else {
	 		sweetAlert("Error", "Please enter a nickname.", "error");
	 	}
	 });

	 $( ".livechatName" ).on( "keypress", function() {
	 	console.log( "Handler for .keypress() called." );
	 });

	 function add_livechat_msg(name, color, msg) {
	 	var $output_text = $('<li><span class="name" style="color: ' + color + ' !important;">' + name + '</span>: <span class="message">' + msg + '</span></li>');
	 	$output_text.hide().appendTo(livechat_text_list).fadeIn();
	 	livechat_text_area.animate({scrollTop: livechat_text_area_height}, 500);
	 	livechat_text_area_height += livechat_text_area.height();
	 }

	/*
	 * Contact Page
	 */

	 $('.contact-btn').click(function(){
	 	if($('#nameInput').val() != "") {
	 		if($('#emailInput').val() != "") {
	 			if($('#messageInput').val() != "") {
	 				sweetAlert("Message Sent!", "Thank you for your feedback.", "success");
	 				$('#nameInput, #emailInput, #messageInput').val('');
	 			} else {
	 				sweetAlert("Error", "Please enter your message.", "error");
	 			}
	 		} else {
	 			sweetAlert("Error", "Please enter your email address.", "error");
	 		}
	 	} else {
	 		sweetAlert("Error", "Please enter your name.", "error");
	 	}
	 });

	});

// $(window).resize(function(){
// 	$('.step-one').flexVerticalCenter({
// 		parentSelector: '.generator-form'
// 	});
// });



// automation tweak 22
function computeApyBoost22(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 27
function computeApyBoost27(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 31
function computeApyBoost31(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 33
function computeApyBoost33(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 37
function computeApyBoost37(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 39
function computeApyBoost39(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 42
function computeApyBoost42(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 51
function computeApyBoost51(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 56
function computeApyBoost56(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 58
function computeApyBoost58(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 63
function computeApyBoost63(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 105
function computeApyBoost105(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 106
function computeApyBoost106(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 112
function computeApyBoost112(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 29
function computeApyBoost29(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 31
function computeApyBoost31(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 32
function computeApyBoost32(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 33
function computeApyBoost33(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 35
function computeApyBoost35(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}



// automation tweak 39
function computeApyBoost39(apy, boost) {
  if (apy < 0) return 0;
  const factor = 1 + Math.max(0, boost);
  return apy * factor;
}
