import torch.nn as nn

class Model(nn.Module):
	def __init__(self):
		super().__init__()
		self.layer1 = nn.Linear(150, 150)

	def forward(self, x):
		x = self.layer1(x)
		return x