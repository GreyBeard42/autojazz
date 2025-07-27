Tone.start()
Tone.Transport.bpm.value = 90
const synth = new Tone.PolySynth().toDestination()

class Chord {
    constructor(root, type) {
        this.root = root
        this.type = type
        this.notes = [root]
        this.getNotes()
    }
    getNotes() {
        if(this.type === 0) {
            this.notes.push(this.root+4)
            this.notes.push(this.root+7)
            this.notes.push(this.root+11)
        } else if(this.type === 1) {
            this.notes.push(this.root+4)
            this.notes.push(this.root+7)
            this.notes.push(this.root+10)
        } else if(this.type === 2) {
            this.notes.push(this.root+3)
            this.notes.push(this.root+7)
            this.notes.push(this.root+10)
        } else if(this.type === 3) {
            this.notes.push(this.root+4)
            this.notes.push(this.root+7)
            this.notes.push(this.root+12)
        }
    }
    getLetterNotes() {
        let notes = []
        this.notes.forEach((note) => {notes.push(Tone.Frequency(note, "midi").toNote())})
        return notes
    }
}

let ALLCHORDS = []
for(let i=54; i<78; i++) {
    let note = Tone.Frequency(i, "midi").toNote()
    for(let t=0; t<4; t++) {
        ALLCHORDS.push(new Chord(Tone.Frequency(note).toMidi(), t))
    }
}

function selectNextChord() {
    let scores = []
    let prev = chords[chords.length-1]
    let i = 0
    ALLCHORDS.forEach((c) => {
        let score = 0
        c.notes.forEach((n) => {
            n = Tone.Frequency(n).toMidi()
            let prevnotes = []
            prev.notes.forEach((p) => {
                prevnotes.push(Tone.Frequency(p).toMidi())
            })
            if(prevnotes.includes(n)) score += 3
            if(prevnotes.includes((n+1) % 12) || prevnotes.includes((n+11) % 12)) score += 2
            if(prevnotes.includes((n+2) % 12) || prevnotes.includes((n+10) % 12)) score += 1
        })
        
        if((Tone.Frequency(prev.root).toMidi() - Tone.Frequency(c.root).toMidi() + 12) % 12 === 7) score += 2

        if(prev.type === 1 && c.type === 2) score += 2

        if(prev.type == c.type || prev.root == c.root) score = 0
        
        if(score>2) for(let i=0; i<=score; i++) scores.push(i)
        i++
    })

    return ALLCHORDS[scores[Math.floor(Math.random()*scores.length)]]
}

let chords = []
chords.push(new Chord(Math.round(Math.random()*12)+52, Math.floor(Math.random()*4)))
chords.push(selectNextChord())
chords.push(selectNextChord())
chords.push(selectNextChord())

let output = document.getElementById("output")
output.innerText = ""
let i=0
chords.forEach((chord) => {
    output.innerText += "  "+Tone.Frequency(chord.root, "midi").toNote().replace(/[0-9]/g, '')
    if(chord.type === 0) output.innerText += "M7"
    else if(chord.type === 1) output.innerText += "7"
    else if(chord.type === 2) output.innerText += "m7"
    else if(chord.type === 3) output.innerText += "M"
    i++
    if(i<chords.length) output.innerText += ","
})
console.log(output.innerText)

document.getElementById("play").addEventListener("click", () => {
    Tone.Transport.stop()
    Tone.Transport.cancel()
    Tone.Transport.position = 0
    Tone.Transport.start()

    let i = 0
    chords.forEach((c) => {
        Tone.Transport.schedule((time) => {
            synth.triggerAttackRelease(c.getLetterNotes(), 1, time)
        }, i)
        i += 1.1
    })
    Tone.Transport.start()
})