var Dic = {
	"dicFile": "edict-en",
	"submit": function() {
		$("dic_busy").show()
		new Ajax.Request('/dic', {
			method: 'get',
			parameters: {
				dic: Dic.dicFile,
				j: $("dic_ja").value,
				m: $("dic_fr").value,
			},
			onSuccess: function(transport) {
				$("dic_busy").hide()
				$("dic").show()
				$("dic").innerHTML = transport.responseText;
			},
			onFailure: function() {
				$("dic_busy").hide()
				$("dic").show()
				$("dic").innerHTML = "An error occurred, sorry.";
			},
		});
	},
	"setDic": function(name) {
		Dic.dicFile = name
		Dic.submit()
	},
	"hide": function() {
		$("dic").hide()
	},
};
