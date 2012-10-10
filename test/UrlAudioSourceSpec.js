describe("UrlAudioSource", function() {
  var context;
  var source;

  beforeEach(function() {
		window.AudioContext = window.webkitAudioContext;
    context = new AudioContext();
    source = new UrlAudioSource(context, "../media/sweep.mp3");
  });

  it("should decode audio after loading", function () {  
    expect(source.source).not.toBe(null);  
  }); 
  
});
