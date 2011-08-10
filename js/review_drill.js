
/* For kimidori-web, written by Alex AUVOLAT, BSD license. */

// UTILITY		(copied from about.com)
Array.prototype.shuffle = function() {
	var s = [];
	while (this.length) s.push(this.splice(Math.random() * this.length, 1)[0]);
	while (s.length) this.push(s.pop());
	return this;
}




const SM_REVIEW = 1				// Review mode
const SM_DRILL = 2				// Drill mode

const SRS_PB_W = 200			// progress bar width

const SQ_FROM_JA = 1			// question from Japanese
const SQ_FROM_M = 2				// question from meaning


var SRSItem = Class.create({
	initialize: function(data) {
		this.data = data;
		this.question = (Math.random() > 0.5 ? SQ_FROM_M : SQ_FROM_JA);
		this.successes = 0;
	},
	id: function() {
		return this.data.Id;
	},
	showQuestion: function() {
		$("q_g_div").innerHTML = "<span>" + this.data.Group + " - " + this.data.Subgroup + "</span>";
		if (this.question == SQ_FROM_JA) {
			$("q_m_div").innerHTML = '<textarea id="m" tabindex="1"></textarea>';
			$("q_j_div").innerHTML = '<strong>' + this.data.Japanese + '</strong>';
		} else {
			$("q_m_div").innerHTML = '<strong>' + this.data.Meaning + '</strong>';
			$("q_j_div").innerHTML = '<textarea id="j" tabindex="1"></textarea>';
		}
		$("q_r_div").innerHTML = (this.data.Reading == "" ?
			'<span>aucune réponse demandée</span>' : '<textarea id="r" tabindex="2"></textarea>');
		$("a_form").hide();
		$("q_form").show();
		if (this.question == SQ_FROM_JA) $("m").focus();
		else $("j").focus();
	},
	showAnswer: function() {
		//also looks out for the values the user had given when answering the question
		$("a_g_div").innerHTML = "<span>" + this.data.Group + " - " + this.data.Subgroup + "</span>";
		$("a_m_div").innerHTML = "<strong>" + this.data.Meaning + "</strong>";
		if (this.question == SQ_FROM_JA) $("a_m_div").innerHTML += ($("m").value == "" ?
			"<span>vous n'aviez donné aucune réponse</span>" :
			"<span>votre réponse : " + $("m").value + "</span>");
		$("a_j_div").innerHTML = "<strong>" + this.data.Japanese + "</strong>";
		if (this.question == SQ_FROM_M) $("a_j_div").innerHTML += ($("j").value == "" ?
			"<span>vous n'aviez donné aucune réponse</span>" :
			"<span>votre réponse : " + $("j").value + "</span>");
		$("a_r_div").innerHTML = (this.data.Reading == "" ?
			'<span>aucune réponse demandée</span>' : "<strong>" + this.data.Reading + "</strong>");
		if (this.data.Reading != "") $("a_r_div").innerHTML += ($("r").value == "" ?
			"<span>vous n'aviez donné aucune réponse</span>" :
			"<span>votre réponse : " + $("r").value + "</span>");
		$("a_c_div").innerHTML = this.data.Comment;
		$("q_form").hide();
		$("a_form").show();
		$("a_sb").focus();
	},
	swapQuestion: function() {
		if (this.successes == 0) {
			this.question = (this.question == SQ_FROM_JA ? SQ_FROM_M : SQ_FROM_JA);
		}
	},
	successed: function() {
		this.swapQuestion();
		this.successes++;
	},
	failed: function() {
		this.swapQuestion();
	},
	isFinished: function() {
		return this.successes == 2;
	},
});

var SRS = {
	shuffledItems: [],
	currentItem: 0,
	successCount: 0,
	failCount: 0,
	totalCount: 0,
	unsavedSuccess: [],
	unsavedFail: [],

	start: function() {
		// 1. Load up srs_data into SRSItem instances, in SRS.shuffledItems
		for (var i = 0; i < srs_data.length; i++) {
			SRS.shuffledItems.push(new SRSItem(srs_data[i]));
		}
		SRS.totalCount = srs_data.length
		// 2. Display first item
		SRS.currentItem = SRS.shuffledItems.length;		// will ensure items are shuffled
		SRS.next();
	},
	save: function() {
		if (SRS.unsavedSuccess.length == 0 && SRS.unsavedFail.length == 0) return;
		if (srs_mode != SM_REVIEW) return;

		var s = Object.toJSON(SRS.unsavedSuccess);;
		var f = Object.toJSON(SRS.unsavedFail);
		new Ajax.Request("/srs_save", {
			method: "post",
			parameters: {
				success: s,
				fail: f,
			},
			onSuccess: function(t) {
				SRS.updateProgressDisplay();
			},
		});
		SRS.unsavedSuccess = [];
		SRS.unsavedFail = [];
	},
	saveAndExit: function() {
		SRS.save();
		window.location = '/srs_home';
	},

	updateProgressDisplay: function() {
		$("progress").innerHTML = 'Progression : <div class="bar" style="height: 12px">' +
			'<div class="rknown" style="width: ' + (SRS.successCount * SRS_PB_W / SRS.totalCount) + 'px"></div>' +
			'<div class="di" style="width: ' +
				((SRS.totalCount - SRS.successCount - SRS.failCount) * SRS_PB_W / SRS.totalCount) + 'px"></div>' +
			'<div class="r1" style="width: ' + (SRS.failCount * SRS_PB_W / SRS.totalCount) + 'px"></div></div>' +
			(srs_mode == SM_REVIEW && (SRS.unsavedSuccess.length > 0 || SRS.unsavedFail.length > 0) ?
				'<a href="#" onclick="SRS.save();">enregistrer</a>' : '');
	},

	next: function() {
		if (SRS.shuffledItems.length == 0) {
			SRS.saveAndExit();
			return;
		}

		SRS.currentItem++;
		if (SRS.currentItem >= SRS.shuffledItems.length) {
			SRS.currentItem = 0;
			SRS.shuffledItems.shuffle();
		}

		SRS.shuffledItems[SRS.currentItem].showQuestion();
		SRS.updateProgressDisplay();
	},
	check: function() {
		SRS.shuffledItems[SRS.currentItem].showAnswer();
	},
	success: function() {
		SRS.shuffledItems[SRS.currentItem].successed();
		if (SRS.shuffledItems[SRS.currentItem].isFinished()) {
			SRS.successCount++;
			if (srs_mode == SM_REVIEW) {
				SRS.unsavedSuccess.push(SRS.shuffledItems[SRS.currentItem].id())
			}
			SRS.shuffledItems.splice(SRS.currentItem, 1)
			SRS.currentItem--;
		}
		SRS.next();
	},
	fail: function() {
		SRS.shuffledItems[SRS.currentItem].failed();
		if (srs_mode == SM_REVIEW) {
			SRS.unsavedFail.push(SRS.shuffledItems[SRS.currentItem].id());
			SRS.failCount++;
			SRS.shuffledItems.splice(SRS.currentItem, 1)
			SRS.currentItem--;
		}
		SRS.next();
	},
};
