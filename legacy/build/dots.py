import sys; sys.path.insert(0,'.')
from contrast import cr
from palette import L,D
LD=dict(hold="#8D887E",working="#3A8C60",waiting="#B87A12",customer="#2F8795",support="#6C69C8",problem="#C0503F")
DD=dict(hold="#8D897F",working="#5BBE8B",waiting="#E2A84C",customer="#58B3C0",support="#9E9DF0",problem="#EC7F6C")
for nm,P,S in [('L',L,LD),('D',D,DD)]:
  for k,v in S.items():
    print(nm,k,v,' '.join(f"{g}:{cr(v,P[g]):.2f}" for g in ['panel','raised','fill','selected','canvas']))
