% Beispiel aus Niemeier, Ausgeleichsrechnung, S156ff

rho = 200/pi;

K = [ 104 40686.792 26816.143
      106 41932.838 28872.552
      113 42242.231 27492.007
      280 40350.846 28835.979 ];

Kn = [ 108 40759.4 27816.1
       110 41373.0 27904.0 ];

%Kn = [ 108 40759.37489 27816.11019
%       110 41373.01826 27904.00689 ];

L = [  370.6444
      1098.643
       199.5131
      1002.598
       108.5994
      1517.862
        35.4146
      1118.689
       292.9943
       619.905
       237.8763
      1286.215
       130.2278
       961.911 ];

ql = [ 0.5
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
      5.0 ];

for i = 1:2:14
  ql(i)= ql(i)/1000;
  L(i) = L(i);
end

for i = 2:2:14
  ql(i)= ql(i)/1000;
end

for i = 1:14
  ql(i) = ql(i)*ql(i);
end

Ql = diag(ql);
P =inv(Ql);

X = [ Kn(1,2)
      Kn(1,3)
      Kn(2,2)
      Kn(2,3)
      0 % -0.0801185*rho
      0 %0.03220586*rho
];

function [r] = difrx (a, b)
  rho = 200/pi;
    dx = b(2)-a(2);
    dy = b(1)-a(1);
    d = dx^2 + dy^2;
    r = dy/d * rho;
end

function [r] = difry (a, b)
  rho = 200/pi;
    dx = b(2)-a(2);
    dy = b(1)-a(1);
    d = dx^2 + dy^2;
    r = -dx/d * rho;
end

function [r] = difdx (a, b)
    dx = b(2)-a(2);
    dy = b(1)-a(1);
    d = sqrt(dx^2 + dy^2);
    r = -dx/d;
end

function [r] = difdy (a, b)
    dx = b(2)-a(2);
    dy = b(1)-a(1);
    d = sqrt(dx^2 + dy^2);
    r = -dy/d;
end

for j = 1:5

      % Y108     X108       Y110    X110    O108    0110
  A = [ difry(Kn(1,2:3),K(4,2:3))   difrx(Kn(1,2:3),K(4,2:3))                           0                          0  1 0 % 108 -> 280
        difdy(Kn(1,2:3),K(4,2:3))   difdx(Kn(1,2:3),K(4,2:3))                           0                          0  0 0
        difry(Kn(1,2:3),K(1,2:3))   difrx(Kn(1,2:3),K(1,2:3))                           0                          0  1 0 % 108 -> 104
        difdy(Kn(1,2:3),K(1,2:3))   difdx(Kn(1,2:3),K(1,2:3))                           0                          0  0 0
        difry(Kn(1,2:3),K(3,2:3))   difrx(Kn(1,2:3),K(3,2:3))                           0                          0  1 0 % 108 -> 113
        difdy(Kn(1,2:3),K(3,2:3))   difdx(Kn(1,2:3),K(3,2:3))                           0                          0  0 0
                                0                           0   difry(Kn(2,2:3),K(2,2:3))  difrx(Kn(2,2:3),K(2,2:3))  0 1 % 110 -> 106
                                0                           0   difdy(Kn(2,2:3),K(2,2:3))  difdx(Kn(2,2:3),K(2,2:3))  0 0
       -difry(Kn(2,2:3),Kn(1,2:3)) -difrx(Kn(2,2:3),Kn(1,2:3))  difry(Kn(2,2:3),Kn(1,2:3)) difrx(Kn(2,2:3),Kn(1,2:3)) 0 1 % 110 -> 108
       -difdy(Kn(2,2:3),Kn(1,2:3)) -difdx(Kn(2,2:3),Kn(1,2:3))  difdy(Kn(2,2:3),Kn(1,2:3)) difdx(Kn(2,2:3),Kn(1,2:3)) 0 0
                                0                           0   difry(Kn(2,2:3),K(1,2:3))  difrx(Kn(2,2:3),K(1,2:3))  0 1  % 110 -> 104
                                0                           0   difdy(Kn(2,2:3),K(1,2:3))  difdx(Kn(2,2:3),K(1,2:3))  0 0
                                0                           0   difry(Kn(2,2:3),K(3,2:3))  difrx(Kn(2,2:3),K(3,2:3))  0 1  % 110 -> 113
                                0                           0   difdy(Kn(2,2:3),K(3,2:3))  difdx(Kn(2,2:3),K(3,2:3))  0 0
  ];

  function [d] = dist (a,b)
    dx = b(2)-a(2);
    dy = b(1)-a(1);
    d = sqrt(dx^2 + dy^2);
  end

  function [d] = richtung (a,b)
    rho = 200/pi;
    dx = b(2)-a(2);
    dy = b(1)-a(1);
    d = atan2(dy,dx)*rho;
  end

  L0 = [
    richtung(Kn(1,2:3),K(4,2:3))+X(5)
    dist(Kn(1,2:3),K(4,2:3))
    richtung(Kn(1,2:3),K(1,2:3))+X(5)
    dist(Kn(1,2:3),K(1,2:3))
    richtung(Kn(1,2:3),K(3,2:3))+X(5)
    dist(Kn(1,2:3),K(3,2:3))
    richtung(Kn(2,2:3),K(2,2:3))+X(6)
    dist(Kn(2,2:3),K(2,2:3))
    richtung(Kn(2,2:3),Kn(1,2:3))+X(6)
    dist(Kn(2,2:3),Kn(1,2:3))
    richtung(Kn(2,2:3),K(1,2:3))+X(6)
    dist(Kn(2,2:3),K(1,2:3))
    richtung(Kn(2,2:3),K(3,2:3))+X(6)
    dist(Kn(2,2:3),K(3,2:3))
  ];

  dl = L-L0;

  for i = 1:2:14
    if dl(i) < -200
      dl(i)  = dl(i) + 400;
    elseif dl(i) >= 200
      dl(i) = dl(i)-400;
    endif
  endfor


  %%for i = 1:2:14
  %   messung = L(i)*rho
  %   naeherung = L0(i)*rho
  %   differenz = dl(i)*rho
  %endfor

  %dl

   N = A'*P*A;
   Qx = inv(N);
   n = A'*P*dl;
   dx = Qx*n;
   X = X+dx;

   sum(abs(dx))

   Kn(1,2) = X(1);
   Kn(1,3) = X(2);
   Kn(2,2) = X(3);
   Kn(2,3) = X(4);
 endfor
dl;
 X
 dx;
