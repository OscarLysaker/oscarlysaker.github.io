(function( $ ) {
    $.fn.makeLock = function(dialNum){ 
        console.clear()
        var combo
        var dials        = dialNum || $(this).attr('data-dials') || 3
        var lock         = $(this).addClass('myLock')
        
        lock.append('<div class="lockInset">'
                        +'<div class="lockLine"></div>'
                        +'<div class="lockWrapper"></div>'
                      +'</div>')
        
        var enterBTN    = $('<div class="btnEnter button">Enter</div>').appendTo(lock)
        var lockWrapper = lock.find('.lockWrapper')
        
        for(var i = 0; i< dials; i++){
          var dial = $( '<div class="dial"><ol></ol></div>').appendTo(lockWrapper)
          var slider = dial.find('ol')
          for(var n = 0; n < 10; n++){
            slider.append('<li>'+n+'</li>')
          }
          slider.prepend( slider.find('li:last-child') )
        }
        lockWrapper.append('<div class="shadow"></div>')
  
        var dialMove    = function(e){
          $(this).append( $('li:first-child', this))
          TweenLite.fromTo(this, 0.35, {top:0}, {top:-50,ease: Power2.easeOut})
        }
        lock.find('ol').on('click', dialMove)
  
        var checkLock    = function(e){
          combo = ''
          lock.find('li:nth-child(2)').each( function(){
            combo += $(this).text()
          })
          //console.log(combo)
          if (combo == "3056837") {
            alert("Bra jobba, dere klarte det! :D\nOrdet er 'KINKIG JULEFYLL'!")
          }
        }      
        enterBTN.on('click', checkLock)
      }
  }( jQuery ));
  
  $("#lock").makeLock()