% Beispiel aus Niemeier, Ausgeleichsrechnung, S156ff

K = [ 104 40686.792 26816.143
      106 41932.838 28872.552
      113 42242.231 27492.007
      280 40350.846 28835.979 ];

Kn = [ 108 40759.4 27816.1
       110 41373.0 27904.0 ]

L = [    5.82207
      1098.643
         3.13394
      1022.598
         1.70588
      1517.862
         0.55629
      1118.689
         4.60234
       619.905
         3.73655
      1286.215
         2.04561
       961.911 ]

p = [ 0.5
      5.0
      0.5
      5.0
      0.5
      5.0
      0.5
      5.0
      0.5
      5.0
      0.5
      5.0
      0.5
      5.0 ]
p = [p(:)/200*pi]

for i = 1:13
  p(i) = p(i)*p(i)
end

X = [ Kn(1,2)
      Kn(1,3)
      Kn(2,2)
      Kn(2,3)
      0
      0 ]

function [r] = difrx (y1,x1,y2,x2)
    dx = x2-x1
    dy = y2-y1
    d = dx^2 + dy^2
    r = dy/d
end

function [r] = difry (y1,x1,y2,x2)
    dx = x2-x1
    dy = y2-y1
    d = dx^2 + dy^2
    r = -dx/d
end

function [r] = difdx (y1,x1,y2,x2)
    dx = x2-x1
    dy = y2-y1
    d = sqrt(dx^2 + dy^2)
    r = dx/d
end

function [r] = difdy (y1,x1,y2,x2)
    dx = x2-x1
    dy = y2-y1
    d = sqrt(dx^2 + dy^2)
    r = dy/d
end


    % Y108     X108       Y110    X110    O108    0110
A = [  difry(Kn(1,2),Kn(1,3),K(4,2),K(4,3)) difrx(Kn(1,2),Kn(1,3),K(4,2),K(4,3)) 0 0 1 0% 108 -> 280
       difdy(Kn(1,2),Kn(1,3),K(4,2),K(4,3)) difdx(Kn(1,2),Kn(1,3),K(4,2),K(4,3)) 0 0 0 0
       difry(Kn(1,2),Kn(1,3),K(1,2),K(1,3)) difrx(Kn(1,2),Kn(1,3),K(1,2),K(1,3)) 0 0 1 0 % 108 -> 104
       difdy(Kn(1,2),Kn(1,3),K(1,2),K(1,3)) difdx(Kn(1,2),Kn(1,3),K(1,2),K(1,3)) 0 0 0 0
       % 108 -> 113
       % 110 -> 106
       % 110 -> 108
       % 110 -> 104
       ]% 110 -> 113
