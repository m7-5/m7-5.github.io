function similarity(song1, song2) {
  const NOTE_MAP = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };

  const parseNum = (onmei, i) => {
    let num = NOTE_MAP[onmei.charAt(0)] ?? null;
    if (num === null) return null;

    num += i + (onmei.includes('#') ? 1 : 0) - (onmei.includes('b') ? 1 : 0);
    return (num + 24) % 12;
  }

  const parseTriad = (chordName) => {
    return chordName.replace(/(add9|M9|\+9|M7|7|69|9|dim)/g, match => (match === 'dim' ? 'm-5' : ''));
  }

  const PATTERN_MAP = {
    'sus2': [0, 2, 7],
    'sus4': [0, 5, 7],
    'aug': [0, 4, 8],
    'm-5': [0, 3, 6],
    '-5': [0, 4, 6],
    'm': [0, 3, 7],
    'default': [0, 4, 7],
  };

  const kouseion = (chord, t) => {
    const chordName = parseTriad(chord);
    let count = Array(12).fill(0);

    if (chordName.includes('/')) {
      // 分数コードの場合
      const [baseChord, root] = chordName.split('/');
      count[parseNum(root, t)] += 1;

      const pattern = Object.keys(PATTERN_MAP).find(key => baseChord.includes(key)) || 'default';
      PATTERN_MAP[pattern].forEach((interval, index) => {
        count[parseNum(baseChord.replace(pattern, ''), t + interval)] += 1; // ルート音だけ2カウント
      });
    } else {
      // 分数コード以外の場合
      const pattern = Object.keys(PATTERN_MAP).find(key => chordName.includes(key)) || 'default';
      PATTERN_MAP[pattern].forEach((interval, index) => {
        count[parseNum(chordName.replace(pattern, ''), t + interval)] += 1; // ルート音だけ2カウント
      });
    }
    if (count.reduce((sum, x) => sum + x ** 2, 0) == 0) {
      console.log(chordName, t + 'の大きさは0でした。')
    }

    return count;
  }

  const chordSimilarity = (chord1, chord2, t) => {
    const kousei1 = kouseion(chord1, 0);
    const kousei2 = kouseion(chord2, t);
    const k1Size = Math.sqrt(kousei1.reduce((sum, count) => sum + count ** 2, 0)); // ベクトルkousei1の大きさ
    const k2Size = Math.sqrt(kousei2.reduce((sum, count) => sum + count ** 2, 0)); // ベクトルkousei2の大きさ
    const dotProduct = kousei1.reduce((sum, count, i) => sum + count * kousei2[i], 0); // ベクトルkousei1, kousei2の内積
    // console.log(k1Size, k2Size, dotProduct);
    // return 1 - Math.sqrt(kousei1.reduce((sum, count, i) => sum + (count - kousei2[i]) ** 2, 0) / 12);
    return dotProduct / ( k1Size * k2Size );
  }

  const chordProgressionSimilarity = (a, b) => {
    // 空白（''）を前のコードで埋める処理
    let aFixed = [];
    let bFixed = [];
    for (let i = 0; i < a.chord.length; i++) {
      aFixed[i] = a.chord[i];
      if (aFixed[i] == '' && i > 0) {
        aFixed[i] = aFixed[i - 1];
      }
    }
    for (let i = 0; i < b.chord.length; i++) {
      bFixed[i] = b.chord[i];
      if (bFixed[i] == '' && i > 0) {
        bFixed[i] = bFixed[i - 1];
      }
    }
    const t = a.key - b.key;
    console.log(a.title, aFixed);
    console.log(b.title, bFixed);
    return aFixed.reduce((sum, chord, i) => sum + chordSimilarity(chord, bFixed[i], t), 0) / aFixed.length;
  }

  const a = song1;
  const b = song2;
  return chordProgressionSimilarity(a, b);

}