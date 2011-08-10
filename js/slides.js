/* For kimidori-web, written by Alex AUVOLAT, BSD license. */

function do_load() {
	Slides.setup();
}

var Slides = {
	current: 0,

	setup: function() {
		if (self.document.location.hash.substring(1, 5) == "part") {
			var id = parseInt(self.document.location.hash.substring(5));
			for (var i = 0; i < chunk_toc.length; i++) {
				if (chunk_toc[i].Number == id) {
					Slides.current = i;
				}
			}
		}
		Slides.show();
	},
	prev: function() {
		if (Slides.current > 0) {
			Slides.current--;
			Slides.show();
		}
	},
	next: function() {
		if (Slides.current < chunk_toc.length - 1) {
			Slides.current++;
			Slides.show();
		}
	},
	show: function() {
		for (var i = 0; i < chunk_toc.length; i++) {
			$("part" + chunk_toc[i].Number).hide();
		}
		$("part" + chunk_toc[Slides.current].Number).show();
		$("prevnext").innerHTML = "";
		if (Slides.current > 0) {
			$("prevnext").innerHTML = '<div style="float: left"><a href="#part' +
				chunk_toc[Slides.current-1].Number + '" onclick="Slides.prev()">← ' +
				chunk_toc[Slides.current-1].Title + '</a></div>';
		}
		if (Slides.current < chunk_toc.length - 1) {
			$("prevnext").innerHTML += '<div style="float: right"><a href="#part' +
				chunk_toc[Slides.current+1].Number + '" onclick="Slides.next()">' +
				chunk_toc[Slides.current+1].Title + ' →</a></div>';
		}
		$("prevnext").innerHTML += '<div style="clear: both; text-align: center;">' + chunk_toc[Slides.current].Title + '</div>';
	},
};
