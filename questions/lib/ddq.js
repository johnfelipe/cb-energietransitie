function DDQ(question, qEle) {
  this.question = question;
  this.qEle = qEle;
  this.result = {
    incorrect: false,
    correct: false,
    maybe: false,
    hint: false,
  }
  this.$q = function(selector) {
    return $(this.qEle).find(selector);
  }
}

DDQ.questionType = "ddq";
DDQ.prototype = {
  targetList: [],
  submissionList: [],
  targets: [],
  positions:[],

  create: function() {
    var self = this;
    $(this.qEle).addClass("ddq");
    this.targetList = this.question.targetList;
    self.submissionList = $.extend(true,[],this.targetList);
    $.each(self.submissionList, function(k, v) {
      self.submissionList[k].conceptList=[];
    });

    var poscnt=0;
    $.each(this.targetList, function(k, v) {
      $.each(v.conceptList, function(_k, _v) {
        self.positions[poscnt]={}
        self.positions[poscnt].name=_v.text;
        self.positions[poscnt].pos=-1;
        poscnt++;
      })
    });

    this.drawQuestion();
    this.drawAnswers();
    self.$q(".table-feedback").appendTo(self.$q("#question-text"));
    self.$q(".table-feedback").hide();

    //self.test();
  },

  drawQuestion: function() {
    var self = this;
    this.$q("#question-text").html(this.question.text);
    this.$q("#q-text").html("");
    this.$q("#tr-text").show();
    var per = 90 / this.targetList.length
    $.each(this.targetList, function(k, v) {
      var target_div = $("<td>").addClass("target")
      if (v.image) {
        $("<img>").addClass('target-image')
            .attr("src", v.image)
            .appendTo(target_div);
      }
      $("<div>").addClass('target-title')
            .html(v.text)
            .appendTo(target_div);
      target_div.idx = k
      target_div.answers = [];
      self.targets.push(target_div);
      $(target_div).css("width", per + "%");
      self.$q('#tr-text').append(target_div);

      $(target_div).droppable({
        greedy: true,
        activeClass: "ui-state-hover",
        hoverClass: "ui-state-active",
        drop: function( event, ui ) {
          target_div.answers.push(ui.draggable[0]);
          $(target_div).append(ui.draggable[0]);
          $(ui.draggable[0]).css("left", "0px")
          $(ui.draggable[0]).css("top", "0px");
          $(ui.draggable[0]).attr("target_idx", target_div.idx);

          var poscnt=0;
          $.each(self.targetList, function(k, v) {
            $.each(v.conceptList, function(_k, _v) {
              if(self.positions[poscnt].name == $(ui.draggable[0])[0].innerText){
                self.positions[poscnt].pos = $(ui.draggable[0]).attr("target_idx");
              }                    
              poscnt++;
            })
          });

          $(ui.draggable[0]).css("border", "2px solid orange");
          self.checkDone();
        }
      });
    });
  },

  drawAnswers: function() {
    var self = this;
    var $a = self.$q("#top-answer");
    
    var concepts = [];
    $.each(self.targetList, function(k, target) {
      $.each(target.conceptList, function(_k, concept) {
        var concept_div = $("<div class='concept'>" + concept.text + "</div>")
          .attr("answer_idx", k)
          .draggable({
            start: function(event, ui) {
                $(event.target).css("z-index","100");
            },
            stop: function(event, ui) {
                $(event.target).css("z-index","0");
            },
          });
        if (concept.image) {
          $("<img>").attr("src", concept.image).prependTo(concept_div);
        }
        concepts.push(concept_div);
      });
    });
    concepts = shuffle(concepts);
    $.each(concepts, function(k, concept_div) {
      $a.append(concept_div);
    });

    $('body').droppable({
      activeClass: "ui-state-hover",
      hoverClass: "ui-state-active",
      drop: function( event, ui ) {
        $a.append(ui.draggable[0]);
        $(ui.draggable[0])
            .css("border", "2px dashed orange")
            .css("left", "0")
            .css("top", "0");
        self.checkDone();
      }
    });
  
    self.$q("#send-button").hide(); 
    self.$q(".table-feedback")
        .css("border", "none")
        .show();

    self.$q("#check-button").click(function(){
      if (self.checkAnswer()) {
        self.$q("#check-button").hide();
        self.$q("#send-button").show();
      }
    });
  },

  checkDone: function() {
    var self = this;
    var done=true;
    self.$q(".concept").each(function(k,concept) {
      if ($(concept).parent().hasClass("target") == false) {
        done=false;
      }
    });
    self.$q("#check-button").toggle(done);
    self.$q(".table-feedback").toggle(done);
    return done;
  },
  
  checkAnswer: function() {
    this.result.correct = true;
    
    var self = this;
    for (var i=0; i<self.positions.length;i++){
      newentry2 = self.submissionList[self.positions[i].pos].conceptList.length;
      self.submissionList[self.positions[i].pos].conceptList[newentry2]={}
      self.submissionList[self.positions[i].pos].conceptList[newentry2].type="text"
      self.submissionList[self.positions[i].pos].conceptList[newentry2].text=self.positions[i].name
    }


    $.each(this.targets, function(k, v) {
      $.each(v.answers, function(_k, answer) {

        $(answer).draggable( "option", "disabled", true );

        if ($(answer).attr("answer_idx") != $(answer).attr("target_idx")) {
          self.result.correct = false;
          self.result.incorrect = true;
          $(answer).css("border-color", "red");
          
          $.each(self.targetList, function(kk, v) {
            $.each(v.conceptList, function(_kk, _v){
              if(_v.text == $(answer)[0].innerText){
                $.each(self.submissionList, function(k2, v2) {
                  $.each(v2.conceptList, function(_k2, _v2) {
                    if(_v2.text == _v.text){
                      _v2.correct = false
                      _v.concept_idx=k2;
                    }
                  })
                });
                _v.correct=false;                 
              }
            });
          });
        } 
        else{
          $(answer).css("border-color", "green");
          $.each(self.targetList, function(kk, v) {
            $.each(v.conceptList, function(_kk, _v) {
              if(_v.text == $(answer)[0].innerText){
                $.each(self.submissionList, function(k2, v2) {
                  $.each(v2.conceptList, function(_k2, _v2) {
                    if(_v2.text == _v.text){
                      _v2.correct = true
                      _v.concept_idx=k2;
                    }
                  })
                });
                _v.correct=true;                    
              }
            });
          });
        }
          
      });
    });
    this.question.submissionList = self.submissionList
    return true;
  },
  
  test: function() {
    var self = this;
    $('.concept').appendTo($(".target")[0]);
    $('.concept').each(function(k,v) {
        self.positions[k].pos = 0;
    });
    this.checkDone();
  }


}

Questionnaire.registerType(DDQ);
